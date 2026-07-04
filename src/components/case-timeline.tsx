import { motion } from "framer-motion";
import { useState } from "react";
import type { TimelineEvent } from "@/lib/types/case";
import { Calendar, Gavel, FileSearch, Mic, Package } from "lucide-react";

const iconFor: Record<TimelineEvent["kind"], typeof Calendar> = {
  interview: Mic,
  deposition: FileSearch,
  hearing: Gavel,
  trial: Gavel,
  evidence: Package,
};

export function CaseTimeline({ events }: { events: TimelineEvent[] }) {
  const [selected, setSelected] = useState<TimelineEvent | null>(events[events.length - 1] ?? null);
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Case timeline
          </h3>
          <p className="mt-1 font-display text-2xl">Reconstructed chronology</p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 h-full w-px bg-border md:left-1/2" />
        <ul className="space-y-6">
          {events.map((e, idx) => {
            const Icon = iconFor[e.kind];
            const isActive = selected?.id === e.id;
            const align = idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse";
            return (
              <motion.li
                key={e.id}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`relative flex items-start gap-4 pl-10 md:pl-0 ${align}`}
              >
                <button
                  onClick={() => setSelected(e)}
                  className={`absolute left-0 top-1 grid size-8 -translate-x-1/2 place-items-center rounded-full border bg-card transition-all md:left-1/2 ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
                <div className="hidden md:block md:w-1/2" />
                <button
                  onClick={() => setSelected(e)}
                  className={`w-full rounded-lg border p-4 text-left transition-all md:w-1/2 ${
                    isActive ? "border-primary/40 bg-primary-soft/40" : "hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  <div className="text-xs font-medium uppercase tracking-wider text-primary">
                    {e.kind}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{e.label}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(e.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                    {e.document ? ` · ${e.document}` : ""}
                  </div>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
