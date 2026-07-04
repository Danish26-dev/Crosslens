import { motion } from "framer-motion";
import { FileText, Users, Link2 } from "lucide-react";
import type { Evidence, Statement, Witness } from "@/lib/types/case";

export function EvidencePanel({
  evidence,
  witnesses,
  statements,
}: {
  evidence: Evidence[];
  witnesses: Witness[];
  statements: Statement[];
}) {
  const witnessMap = new Map(witnesses.map((w) => [w.id, w]));
  const statementMap = new Map(statements.map((s) => [s.id, s]));

  return (
    <div className="space-y-4">
      {evidence.map((e, i) => (
        <motion.div
          key={e.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                <FileText className="h-3 w-3" />
                {e.kind}
              </div>
              <h4 className="mt-2 font-display text-xl">{e.label}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 border-t pt-4 md:grid-cols-2">
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Users className="h-3 w-3" /> Connected witnesses
              </div>
              <div className="flex flex-wrap gap-1.5">
                {e.linkedWitnessIds.map((wid) => {
                  const w = witnessMap.get(wid);
                  return (
                    <span
                      key={wid}
                      className="rounded-md border bg-muted/40 px-2 py-0.5 text-xs font-medium text-foreground"
                    >
                      {w?.name}
                    </span>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Link2 className="h-3 w-3" /> Related statements
              </div>
              <ul className="space-y-1 text-xs">
                {e.linkedStatementIds.map((sid) => {
                  const s = statementMap.get(sid);
                  if (!s) return null;
                  return (
                    <li key={sid} className="text-foreground/80">
                      <span className="font-medium text-foreground">{s.document}</span>
                      <span className="text-muted-foreground"> · p.{s.page}, ln.{s.line}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
