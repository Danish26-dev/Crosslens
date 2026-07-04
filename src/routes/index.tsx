import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Brain,
  AlertTriangle,
  FileSearch,
  Upload,
  Network,
  MessageSquare,
  Zap,
  LayoutDashboard,
  ShieldCheck,
  Scale,
  Sparkles,
} from "lucide-react";
import { MemorySphere } from "@/components/memory-sphere";
import { Section, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { ContradictionCard } from "@/components/contradiction-card";
import { CountUp } from "@/components/count-up";
import { getContradictionsFn } from "@/lib/api";

const contradictionsQueryOptions = queryOptions({
  queryKey: ["landing-contradictions"],
  queryFn: () => getContradictionsFn(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CrossLens — Enterprise Courtroom Intelligence" },
      {
        name: "description",
        content:
          "Persistent AI memory for trial attorneys. Retrieve prior testimony, detect contradictions in real time, and link every statement to the evidence that supports or refutes it.",
      },
      { property: "og:title", content: "CrossLens — Enterprise Courtroom Intelligence" },
      {
        property: "og:description",
        content:
          "AI-powered courtroom memory. Instant impeachment. Evidence intelligence for litigators.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(contradictionsQueryOptions);
  },
  component: LandingPage,
  errorComponent: ({ error }) => <div className="p-8 text-destructive">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-8">Landing page not found.</div>,
});


const fadeUp = {
  initial: { opacity: 0, y: 24, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
};

function LandingPage() {
  const { data: contradictions } = useSuspenseQuery(contradictionsQueryOptions);
  const firstContradiction = contradictions[0];

  return (

    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-radial-hero" />
        <div className="pointer-events-none absolute inset-0 bg-neural opacity-60" />
        {/* Blurred gradient orbs */}
        <div className="pointer-events-none absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-primary/15 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/3 -left-40 h-[420px] w-[420px] rounded-full bg-indigo/15 blur-[120px]" />

        <div className="relative mx-auto grid min-h-[90vh] max-w-7xl grid-cols-1 items-center gap-8 px-6 pt-24 pb-16 md:grid-cols-[1.05fr_1fr] md:px-10 md:pt-32">
          <div className="flex flex-col justify-center">
            <motion.div
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.6 }}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary shadow-soft backdrop-blur"
            >
              <span className="size-1.5 rounded-full bg-primary" />
              Persistent Memory · Powered by Cognee
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-8 font-display text-[52px] font-bold leading-[0.98] tracking-[-0.03em] text-foreground md:text-[84px]"
            >
              Your Courtroom
              <br />
              <span className="text-gradient-brand">Never Forgets.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl"
            >
              CrossLens is the enterprise memory layer for litigation teams. Retrieve prior
              testimony in milliseconds, surface contradictions as they happen, and connect
              every statement to the evidence that proves it.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <Link
                to="/dashboard"
                onClick={() => {
                  if (typeof window !== "undefined") sessionStorage.setItem("crosslens.tour", "1");
                }}
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-brand px-6 py-3.5 text-sm font-semibold text-white shadow-brand transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-15px_rgba(79,70,229,0.5)]"
              >
                Try the Demo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/dashboard/ask"
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-white px-6 py-3.5 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
              >
                Ask the Case
              </Link>
            </motion.div>

            <div className="mt-14 grid max-w-xl grid-cols-2 gap-8 border-t pt-8 md:grid-cols-4">
              {[
                { k: <><CountUp to={15000} suffix="+" /></>, v: "Pages Indexed" },
                { k: <>&lt;<CountUp to={250} />ms</>, v: "Memory Retrieval" },
                { k: <><CountUp to={98.7} decimals={1} suffix="%" /></>, v: "Contradiction Precision" },
                { k: "Enterprise", v: "Courtroom Ready" },
              ].map((s, i) => (
                <div key={i}>
                  <div className="font-display text-2xl font-bold tracking-tight text-foreground">
                    {s.k}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-[440px] md:h-[640px] md:-mr-24 lg:-mr-40">
            <MemorySphere />
            <div className="pointer-events-none absolute left-6 top-6 rounded-xl border border-white/60 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground shadow-soft backdrop-blur">
              Memory Core · State v. Marshall
            </div>
            <div className="pointer-events-none absolute right-6 bottom-8 flex items-center gap-2 rounded-xl border border-white/60 bg-white/70 px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-soft backdrop-blur">
              <span className="size-1.5 rounded-full bg-destructive animate-pulse" />
              Contradiction detected · Line 217
            </div>
          </div>
        </div>

        {/* Logo bar */}
        <div className="relative mx-auto max-w-6xl border-t border-b bg-white/50 px-6 py-6 backdrop-blur">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <span>Trusted by litigation teams at</span>
            <span className="text-foreground/70">Kellman &amp; Cross</span>
            <span className="text-foreground/70">Halden Voss LLP</span>
            <span className="text-foreground/70">Riverstone Legal</span>
            <span className="text-foreground/70">Ainsworth Trial Group</span>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <Section
        id="problem"
        eyebrow="The Problem"
        title={<>Attorneys can't remember 12,000 pages in real time.</>}
        subtitle="Neither can paralegals. The critical impeachment is buried on page 217 of a deposition you took six months ago — and the witness just contradicted it under oath."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              t: "Depositions get lost in binders",
              d: "The critical impeachment lives on page 217 of a deposition you took six months ago. Good luck finding it in three seconds.",
            },
            {
              t: "Prior statements slip past",
              d: "Witnesses shift dates, colors, and sequences. Without machine memory, most inconsistencies go unchallenged on the record.",
            },
            {
              t: "Evidence lives in silos",
              d: "The forensic report contradicts the officer's timeline — but only if you cross-reference two systems by hand.",
            },
          ].map((c, i) => (
            <motion.div
              key={c.t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-[20px] border bg-card p-8 shadow-soft transition-all hover:-translate-y-1 hover:shadow-float"
            >
              <div className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
                <AlertTriangle className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="mt-6 font-display text-xl font-semibold tracking-tight">{c.t}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{c.d}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* SOLUTION */}
      <Section
        id="solution"
        eyebrow="The Platform"
        title={<>A single memory that reads with you — and remembers everything.</>}
        subtitle="CrossLens ingests every deposition, interview, affidavit, and exhibit into a persistent knowledge graph — then reasons over it live, during trial."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Brain,
              t: "Persistent Memory",
              d: "Every document becomes a searchable knowledge graph. Statements, entities, and citations linked automatically.",
            },
            {
              icon: Zap,
              t: "Live Contradiction Detection",
              d: "As testimony unfolds, CrossLens surfaces the exact prior statement — page and line — before the witness finishes the sentence.",
            },
            {
              icon: Network,
              t: "Evidence Intelligence",
              d: "Statements auto-link to supporting or refuting exhibits the moment they're introduced on the record.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="rounded-[20px] border bg-card p-8 shadow-soft transition-shadow hover:shadow-float"
            >
              <div className="grid size-11 place-items-center rounded-xl bg-gradient-brand text-white shadow-brand">
                <f.icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight">{f.t}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{f.d}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* WORKFLOW */}
      <Section
        id="workflow"
        eyebrow="Workflow"
        title="From upload to impeachment in one continuous flow."
        subtitle="No workflow rewrites. No new team rituals. CrossLens slots into the trial preparation your firm already runs."
      >
        <div className="rounded-[24px] border bg-card p-10 shadow-soft">
          <div className="grid gap-8 md:grid-cols-5">
            {[
              { icon: Upload, t: "Upload documents", d: "PDFs, transcripts, notes" },
              { icon: Brain, t: "Cognee memory graph", d: "Chunked, embedded, linked" },
              { icon: MessageSquare, t: "Live testimony", d: "Streamed in real time" },
              { icon: AlertTriangle, t: "Contradictions", d: "Ranked by confidence" },
              { icon: LayoutDashboard, t: "Attorney dashboard", d: "Insight at a glance" },
            ].map((s, i, a) => (
              <div key={s.t} className="relative flex flex-col items-start gap-4">
                <div className="grid size-12 place-items-center rounded-xl bg-primary-soft text-primary">
                  <s.icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    Step {i + 1}
                  </div>
                  <div className="mt-1 text-[15px] font-semibold text-foreground">{s.t}</div>
                  <div className="text-sm text-muted-foreground">{s.d}</div>
                </div>
                {i < a.length - 1 ? (
                  <ArrowRight className="absolute right-2 top-4 hidden h-4 w-4 text-muted-foreground/60 md:block" strokeWidth={1.5} />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* SHOWCASE */}
      <Section
        eyebrow="Live In Trial"
        title="Impeachment cards appear the moment testimony diverges."
        subtitle="Every finding cites the source document, page, and line — grounded and ready for the record."
      >
        <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr]">
          <div className="overflow-hidden rounded-[24px] border bg-card shadow-float">
            <div className="border-b bg-gradient-to-b from-primary-soft/40 to-transparent p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    State v. Marshall · Dept. 7
                  </div>
                  <div className="mt-1 font-display text-xl font-semibold tracking-tight">
                    Cross-examination · D. Reyes
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full border bg-white px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-destructive animate-pulse" /> Live
                </div>
              </div>
            </div>
            <div className="p-6">
              {firstContradiction ? <ContradictionCard contradiction={firstContradiction} /> : null}
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4">
            {[
              { icon: FileSearch, t: "Grounded citations", d: "Every impeachment cites the source document, page, and line — ready for the record." },
              { icon: Zap, t: "Sub-second recall", d: "Persistent graph memory keeps lookups under 400ms, even across 12,000-page case files." },
              { icon: Network, t: "Cross-witness reasoning", d: "CrossLens correlates statements across witnesses to surface systemic inconsistencies." },
            ].map((f, i) => (
              <motion.div
                key={f.t}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-[20px] border bg-card p-6 shadow-soft"
              >
                <f.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                <div className="mt-4 font-display text-lg font-semibold tracking-tight">{f.t}</div>
                <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{f.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ARCHITECTURE */}
      <Section
        id="architecture"
        eyebrow="Architecture"
        title="A modular pipeline you can trust in court."
        subtitle="Every layer is auditable. Every finding traceable. No hallucinated citations — ever."
      >
        <div className="rounded-[24px] border bg-card p-10 shadow-soft md:p-14">
          <div className="grid items-center gap-6 md:grid-cols-5">
            {[
              { t: "Documents", d: "PDF · DOCX · TXT · Audio" },
              { t: "Memory Graph", d: "Cognee + Chroma" },
              { t: "LLM Reasoning", d: "OpenRouter · Gemini · GPT" },
              { t: "Contradiction Engine", d: "Confidence-scored" },
              { t: "Attorney Dashboard", d: "Realtime UI" },
            ].map((s, i, a) => (
              <div key={s.t} className="relative">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl border bg-background p-5 text-center shadow-soft"
                >
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    Layer {i + 1}
                  </div>
                  <div className="mt-1.5 font-display text-base font-semibold tracking-tight">{s.t}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.d}</div>
                </motion.div>
                {i < a.length - 1 ? (
                  <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 md:block">
                    <ArrowRight className="h-4 w-4 text-muted-foreground/50" strokeWidth={1.5} />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-10 grid gap-6 border-t pt-10 md:grid-cols-3">
            {[
              { icon: ShieldCheck, t: "Auditable pipeline", d: "Every finding traces to a source document, chunk, and line number." },
              { icon: Scale, t: "Grounded reasoning", d: "No hallucinated citations. If it's not in the record, CrossLens won't cite it." },
              { icon: Sparkles, t: "Continuous learning", d: "The memory graph deepens with every deposition your firm indexes." },
            ].map((f) => (
              <div key={f.t} className="flex gap-3">
                <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} />
                <div>
                  <div className="text-sm font-semibold text-foreground">{f.t}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{f.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-brand p-12 text-white shadow-brand md:p-16">
          <div className="pointer-events-none absolute -right-24 -top-24 h-[400px] w-[400px] rounded-full bg-white/10 blur-[80px]" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-[400px] w-[400px] rounded-full bg-white/10 blur-[80px]" />
          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <h3 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                Bring persistent memory into your next trial.
              </h3>
              <p className="mt-3 max-w-xl text-white/80 md:text-lg">
                Book a 20-minute walk-through with the CrossLens team.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-primary shadow-float transition-transform hover:-translate-y-0.5"
            >
              Open the dashboard <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </Section>

      <SiteFooter />
    </div>
  );
}
