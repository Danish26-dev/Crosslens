import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Send, Sparkles, FileText, Zap, Quote } from "lucide-react";
import { askCrossLensFn } from "@/lib/api";

export const Route = createFileRoute("/dashboard/ask")({
  head: () => ({
    meta: [
      { title: "Ask CrossLens · Grounded Q&A" },
      { name: "description", content: "Natural-language questions over the persistent case memory, with source citations." },
    ],
  }),
  component: AskPage,
  errorComponent: ({ error }) => <div className="p-8 text-destructive">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-8">Ask view not found.</div>,
});

const PRESETS = [
  "Who was driving the red sedan?",
  "What time did the collision occur?",
  "Where do the depositions disagree?",
  "What does the evidence report contradict?",
];

function AskPage() {
  const [query, setQuery] = useState("");
  const ask = useMutation({
    mutationFn: (q: string) => askCrossLensFn({ data: { query: q } }),
  });

  const submit = (q: string) => {
    if (!q.trim()) return;
    setQuery(q);
    ask.mutate(q);
  };

  const answer = ask.data;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 md:p-8">
      <div className="rounded-2xl border bg-gradient-to-br from-primary-soft/40 via-card to-card p-6">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Grounded Q&A
        </div>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight md:text-3xl">Ask CrossLens</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Every answer is generated over the Cognee knowledge graph and cites the source documents it drew from.
          No hallucinated citations — ever.
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-4 shadow-soft">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(query);
          }}
          className="flex items-center gap-2"
        >
          <div className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about the case…"
            className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={ask.isPending || !query.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-brand disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
            Ask
          </button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => submit(p)}
              className="rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {ask.isPending && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border bg-card p-6 shadow-soft"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 animate-pulse text-primary" />
              Reasoning over the memory graph…
            </div>
          </motion.div>
        )}
        {answer && !ask.isPending && (
          <motion.div
            key={answer.query}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">Answer</div>
                <div className="flex items-center gap-2">
                  <SourceBadge source={answer.source} />
                  <div className="rounded-full border bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    {answer.latencyMs}ms
                  </div>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
                {answer.answer}
              </p>
            </div>

            {answer.citations.length > 0 && (
              <div className="rounded-2xl border bg-card p-6 shadow-soft">
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">Sources</div>
                <div className="mt-3 space-y-3">
                  {answer.citations.map((c, i) => (
                    <div key={i} className="flex gap-3 rounded-xl border bg-background p-3">
                      <div className="grid size-9 place-items-center rounded-lg bg-primary-soft text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-foreground">
                          [{i + 1}] {c.docName}
                        </div>
                        {c.snippet && (
                          <div className="mt-1 flex gap-1.5 text-xs italic text-muted-foreground">
                            <Quote className="h-3 w-3 flex-none translate-y-0.5" />
                            <span>{c.snippet}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SourceBadge({ source }: { source: "live" | "cached" }) {
  const live = source === "live";
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
      live ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700" : "border-amber-500/30 bg-amber-500/10 text-amber-700"
    }`}>
      <span className={`size-1.5 rounded-full ${live ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
      {live ? "Live · Cognee" : "Cached"}
    </div>
  );
}
