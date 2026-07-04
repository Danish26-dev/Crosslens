import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CheckCircle2, FileText, Loader2, Sparkles, Network } from "lucide-react";
import { listDatasetDocsFn } from "@/lib/api";

const docsQueryOptions = queryOptions({
  queryKey: ["cognee-docs"],
  queryFn: () => listDatasetDocsFn(),
});

export const Route = createFileRoute("/dashboard/ingest")({
  head: () => ({
    meta: [
      { title: "Ingestion Theatre · CrossLens" },
      { name: "description", content: "Watch case documents flow into the Cognee knowledge graph in real time." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(docsQueryOptions);
  },
  component: IngestPage,
  errorComponent: ({ error }) => <div className="p-8 text-destructive">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-8">Ingestion view not found.</div>,
});

const STAGES = ["Uploaded", "Parsed", "Chunked", "Embedded", "Graphed"] as const;

function IngestPage() {
  const { data } = useSuspenseQuery(docsQueryOptions);
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (stageIndex >= STAGES.length) return;
    const t = setTimeout(() => setStageIndex((i) => i + 1), 900);
    return () => clearTimeout(t);
  }, [stageIndex]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-8">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border bg-gradient-to-br from-primary-soft/40 via-card to-card p-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Cognee Pipeline
          </div>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Ingestion Theatre
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Every case document is chunked, embedded and stitched into the persistent memory graph.
            This is the live <code className="rounded bg-muted px-1.5 py-0.5 text-xs">crosslens</code> dataset.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SourceBadge source={data.source} />
          <div className="rounded-xl border bg-card px-4 py-3 text-center">
            <div className="text-2xl font-bold tracking-tight text-foreground">{data.docs.length}</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Documents
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">Pipeline</div>
          <div className="text-xs text-muted-foreground">Streaming from Cognee Cloud</div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          {STAGES.map((s, i) => {
            const done = i < stageIndex;
            const active = i === stageIndex;
            return (
              <div
                key={s}
                className={`rounded-xl border p-3 text-center transition-colors ${
                  done ? "border-primary/40 bg-primary-soft/40" : active ? "border-primary bg-primary/5" : "bg-background"
                }`}
              >
                <div className="grid place-items-center">
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : active ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted" />
                  )}
                </div>
                <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">{s}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {data.docs.map((doc, i) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-soft"
          >
            <div className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-foreground">{doc.name}</div>
              <div className="text-xs text-muted-foreground">
                {doc.extension?.toUpperCase() ?? "DOC"} · Ingested {formatWhen(doc.createdAt)}
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, 20 + stageIndex * 20)}%` }}
                  transition={{ duration: 0.6 }}
                  className="h-full bg-gradient-brand"
                />
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              <Network className="h-3 w-3" /> in graph
            </div>
          </motion.div>
        ))}
      </div>
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
      {live ? "Live · Cognee" : "Cached fallback"}
    </div>
  );
}

function formatWhen(iso: string | null | undefined) {
  if (!iso) return "recently";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "recently";
  }
}
