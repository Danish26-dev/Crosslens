import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Brain, Sparkles, Trash2, Loader2, Send, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  cogneeRememberFn,
  cogneeRecallFn,
  cogneeImproveFn,
  cogneeForgetFn,
  uploadDocument,
} from "@/lib/api";


export const Route = createFileRoute("/dashboard/memory")({
  head: () => ({
    meta: [
      { title: "Memory · CrossLens" },
      { name: "description", content: "Cognee-backed agent memory: remember, recall, improve, forget." },
    ],
  }),
  component: MemoryPage,
});

function MemoryPage() {
  const [fact, setFact] = useState("");
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<{ answer: string; chunks: string[]; dataset: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setBusy("remember-file");
    const t = toast.loading(`cognee.remember(file="${file.name}")…`);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await uploadDocument({ data: form });
      toast.success(`Remembered ${res.name} (${res.status})`, { id: t });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "upload failed", { id: t });
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }


  async function run<T>(op: string, fn: () => Promise<T>, onOk?: (r: T) => void) {
    setBusy(op);
    const t = toast.loading(`cognee.${op}()…`);
    try {
      const r = await fn();
      toast.success(`cognee.${op}() ok`, { id: t });
      onOk?.(r);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `cognee.${op}() failed`, { id: t });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 md:p-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Brain className="h-3.5 w-3.5" /> Cognee memory
        </div>
        <h1 className="mt-1 font-display text-4xl">Agent memory console</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Every action here hits Cognee Cloud directly — visible in your Cognee dashboard.
        </p>
      </div>

      {/* remember */}
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-display text-xl">cognee.remember(text)</h2>
        <p className="mt-1 text-sm text-muted-foreground">Commit a fact to the active case's memory and cognify.</p>
        <div className="mt-3 space-y-2">
          <Label htmlFor="fact">Fact</Label>
          <Textarea
            id="fact"
            placeholder="Doug is the groom. The wedding is Sunday."
            value={fact}
            onChange={(e) => setFact(e.target.value)}
            rows={3}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={!fact.trim() || busy !== null}
              onClick={() =>
                run("remember", () => cogneeRememberFn({ data: { text: fact } }), () => setFact(""))
              }
            >
              {busy === "remember" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Remember text
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,.pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
              }}
            />
            <Button
              variant="secondary"
              disabled={busy !== null}
              onClick={() => fileRef.current?.click()}
            >
              {busy === "remember-file" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Remember file
            </Button>
          </div>

        </div>
      </section>

      {/* recall */}
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-display text-xl">cognee.recall(query)</h2>
        <p className="mt-1 text-sm text-muted-foreground">Ask across every session and document.</p>
        <div className="mt-3 flex gap-2">
          <Input
            placeholder="Where is Doug?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button
            disabled={!query.trim() || busy !== null}
            onClick={() =>
              run(
                "recall",
                () => cogneeRecallFn({ data: { query } }),
                (r) => setAnswer(r),
              )
            }
          >
            {busy === "recall" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Recall"}
          </Button>
        </div>
        {answer && (
          <div className="mt-4 space-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Dataset: {answer.dataset}
            </div>
            <div className="whitespace-pre-wrap text-foreground">{answer.answer || "(no answer)"}</div>
            {answer.chunks.length > 1 && (
              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer">{answer.chunks.length} chunks</summary>
                <ul className="mt-2 space-y-1">
                  {answer.chunks.map((c, i) => (
                    <li key={i} className="whitespace-pre-wrap">{c}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </section>

      {/* improve + forget */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-display text-xl">cognee.improve()</h2>
          <p className="mt-1 text-sm text-muted-foreground">Re-cognify (memify) so the graph gets smarter.</p>
          <Button
            className="mt-3"
            variant="secondary"
            disabled={busy !== null}
            onClick={() => run("improve", () => cogneeImproveFn())}
          >
            {busy === "improve" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Improve
          </Button>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-display text-xl">cognee.forget(dataset)</h2>
          <p className="mt-1 text-sm text-muted-foreground">Drop the active case's dataset from memory.</p>
          <Button
            className="mt-3"
            variant="destructive"
            disabled={busy !== null}
            onClick={() => {
              if (!confirm("Forget the active case's Cognee dataset?")) return;
              run("forget", () => cogneeForgetFn({ data: {} }));
            }}
          >
            {busy === "forget" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Forget
          </Button>
        </div>
      </section>
    </div>
  );
}
