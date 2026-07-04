import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X, Play, Pause } from "lucide-react";

type Step = { path: string; title: string; blurb: string };

const STEPS: Step[] = [
  { path: "/dashboard", title: "Case Command Center", blurb: "State v. Marshall — 5 documents, 3 witnesses, live contradictions." },
  { path: "/dashboard/ingest", title: "Ingestion Theatre", blurb: "Watch every PDF chunk, embed and land in the Cognee knowledge graph." },
  { path: "/dashboard/evidence", title: "Knowledge Graph", blurb: "People, evidence and events wired together — click any node." },
  { path: "/dashboard/timeline", title: "Reconstructed Timeline", blurb: "The graph re-orders testimony chronologically for you." },
  { path: "/dashboard/contradictions", title: "Contradiction Detection", blurb: "Auto-flagged conflicts with source cites and confidence scores." },
  { path: "/dashboard/ask", title: "Ask CrossLens", blurb: "Grounded Q&A over the graph — every answer cites the source." },
];

const STORAGE_KEY = "crosslens.tour";

export function GuidedTour() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [active, setActive] = useState(false);
  const [autoplay, setAutoplay] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY) === "1") {
      setActive(true);
      setAutoplay(true);
    }
  }, []);

  const currentIndex = Math.max(
    0,
    STEPS.findIndex((s) => (s.path === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(s.path))),
  );
  const step = STEPS[currentIndex] ?? STEPS[0];
  const isLast = currentIndex === STEPS.length - 1;

  useEffect(() => {
    if (!active || !autoplay) return;
    const t = setTimeout(() => {
      if (isLast) {
        setAutoplay(false);
        return;
      }
      navigate({ to: STEPS[currentIndex + 1].path });
    }, 4200);
    return () => clearTimeout(t);
  }, [active, autoplay, currentIndex, isLast, navigate]);

  if (!active) {
    return (
      <button
        onClick={() => {
          setActive(true);
          setAutoplay(false);
          sessionStorage.setItem(STORAGE_KEY, "1");
        }}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-4 py-2.5 text-xs font-semibold text-white shadow-brand hover:-translate-y-0.5 transition-transform"
      >
        <Play className="h-3.5 w-3.5" /> Start guided tour
      </button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        key="tour"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        className="fixed bottom-6 right-6 z-50 w-[340px] overflow-hidden rounded-2xl border border-white/60 bg-white/95 shadow-float backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b bg-gradient-brand px-4 py-2.5 text-white">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-90">
            Step {currentIndex + 1} / {STEPS.length}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setAutoplay((v) => !v)}
              className="grid size-6 place-items-center rounded-md hover:bg-white/20"
              title={autoplay ? "Pause autoplay" : "Resume autoplay"}
            >
              {autoplay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={() => {
                setActive(false);
                sessionStorage.removeItem(STORAGE_KEY);
              }}
              className="grid size-6 place-items-center rounded-md hover:bg-white/20"
              title="End tour"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="font-display text-base font-semibold tracking-tight text-foreground">
            {step.title}
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{step.blurb}</p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-6 rounded-full transition-colors ${
                    i <= currentIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <button
              disabled={isLast}
              onClick={() => navigate({ to: STEPS[currentIndex + 1].path })}
              className="inline-flex items-center gap-1 rounded-lg bg-foreground px-3 py-1.5 text-[12px] font-semibold text-background disabled:opacity-40"
            >
              {isLast ? "Done" : "Next"}
              {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
