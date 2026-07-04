import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Radio, Send, Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitTestimony } from "@/lib/api";
import type { Contradiction } from "@/lib/types/case";
import { ContradictionCard } from "@/components/contradiction-card";

type Line = { id: string; text: string; speaker: "Q" | "A"; ts: string };

const SAMPLES = [
  "Wasn't it a black hoodie you saw around 11:15 PM?",
  "Officer, you noted pry marks on the rear window, correct?",
  "So you'd had four drinks that evening, not two beers?",
];

export function LiveTranscript() {
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [current, setCurrent] = useState<Contradiction | null>(null);
  const [thinking, setThinking] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const submit = useServerFn(submitTestimony);


  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [lines, current]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    setInput("");
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    // stream the question in
    const id = crypto.randomUUID();
    setLines((l) => [...l, { id, text: "", speaker: "Q", ts }]);
    const words = text.split(" ");
    for (let i = 0; i < words.length; i++) {
      await new Promise((r) => setTimeout(r, 40));
      setLines((l) =>
        l.map((line) =>
          line.id === id ? { ...line, text: words.slice(0, i + 1).join(" ") } : line,
        ),
      );
    }
    setThinking(true);
    const result = await submit({ data: { utterance: text } });
    setThinking(false);
    setCurrent(result.contradiction);

  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
      <div className="flex flex-col rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive/60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-destructive" />
            </span>
            <div>
              <div className="text-sm font-semibold">Live courtroom transcript</div>
              <div className="text-xs text-muted-foreground">Dept. 7 · State v. Marshall · Day 4</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
            <Radio className="h-3 w-3" /> streaming
          </div>
        </div>

        <div ref={listRef} className="h-[380px] space-y-3 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
              <div>
                <Sparkles className="mx-auto mb-2 h-5 w-5 text-primary" />
                Enter counsel's next question below to begin.
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {SAMPLES.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border bg-card px-3 py-1 text-xs text-foreground/80 transition-colors hover:border-primary hover:text-primary"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {lines.map((l) => (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-10 shrink-0 text-xs text-muted-foreground">{l.ts}</div>
                  <div className="flex-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                      {l.speaker === "Q" ? "Counsel" : "Witness"}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">
                      {l.text}
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="ml-0.5 inline-block h-4 w-1 translate-y-0.5 bg-primary/70"
                      />
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="flex items-center gap-2 border-t p-3"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type the next question or answer..."
            className="border-0 shadow-none focus-visible:ring-0"
          />
          <Button type="submit" size="sm">
            <Send className="h-4 w-4" />
            Send
          </Button>
        </form>
      </div>

      <div className="flex flex-col gap-3">
        <div className="rounded-xl border bg-gradient-to-br from-primary-soft/40 to-transparent p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Memory engine
          </div>
          <p className="mt-1 text-sm text-foreground/80">
            {thinking
              ? "Scanning 4 documents, 128 chunks, 3 prior depositions..."
              : current
                ? "Match found across prior testimony. Review the impeachment card."
                : "Awaiting new testimony. Priors indexed and ready."}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {current ? (
            <ContradictionCard key={current.id} contradiction={current} />
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground"
            >
              No contradictions flagged yet for this utterance.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
