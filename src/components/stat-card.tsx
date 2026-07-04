import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  suffix,
  icon: Icon,
  hint,
  tone = "default",
}: {
  label: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
  hint?: string;
  tone?: "default" | "warning" | "success";
}) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString());
  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.2, ease: "easeOut" });
    return controls.stop;
  }, [value, mv]);

  const toneClass =
    tone === "warning"
      ? "text-warning-foreground bg-warning/15"
      : tone === "success"
        ? "text-success bg-success/10"
        : "text-primary bg-primary-soft";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <motion.span className="font-display text-4xl leading-none text-foreground">
              {rounded}
            </motion.span>
            {suffix ? (
              <span className="text-sm font-medium text-muted-foreground">{suffix}</span>
            ) : null}
          </div>
        </div>
        <div className={`grid size-9 place-items-center rounded-lg ${toneClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {hint ? <div className="mt-3 text-xs text-muted-foreground">{hint}</div> : null}
    </motion.div>
  );
}
