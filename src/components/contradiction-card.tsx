import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, FileText, Quote } from "lucide-react";
import type { Contradiction } from "@/lib/types/case";

export function ContradictionCard({ contradiction }: { contradiction: Contradiction }) {
  const prev = contradiction.previousStatement;
  const witness = contradiction.witness;
  const conf = Math.round(contradiction.confidence * 100);
  const severityColor =
    contradiction.severity === "high"
      ? "bg-destructive/10 text-destructive border-destructive/20"
      : contradiction.severity === "medium"
        ? "bg-warning/15 text-warning-foreground border-warning/30"
        : "bg-muted text-muted-foreground border-border";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
      className="overflow-hidden rounded-xl border bg-card shadow-sm"
    >
      <div className="flex items-center justify-between border-b bg-gradient-to-r from-warning/10 to-transparent px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-md bg-warning/20 text-warning-foreground">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">Potential contradiction detected</div>
            <div className="text-xs text-muted-foreground">
              {witness?.name ?? "Unknown witness"} · {witness?.role ?? ""}
            </div>
          </div>
        </div>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${severityColor}`}>
          {contradiction.severity.toUpperCase()} · {conf}%
        </span>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-2">
        <div className="rounded-lg border border-primary/20 bg-primary-soft/40 p-4">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-primary">
            <Quote className="h-3 w-3" /> Current statement
          </div>
          <p className="text-sm leading-relaxed text-foreground">"{contradiction.currentStatement}"</p>
        </div>

        <div className="rounded-lg border bg-muted/40 p-4">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Quote className="h-3 w-3" /> Prior statement
          </div>
          <p className="text-sm leading-relaxed text-foreground">"{prev?.text ?? "No prior statement linked."}"</p>
          {prev ? (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{prev.document}</span>
              <span>· p. {prev.page}, ln. {prev.line}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-start gap-2 border-t bg-muted/30 px-5 py-3 text-sm">
        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-foreground/80">
          <span className="font-medium text-foreground">Reason: </span>
          {contradiction.reason}
        </p>
      </div>

      <div className="h-1 w-full bg-muted">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${conf}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}
