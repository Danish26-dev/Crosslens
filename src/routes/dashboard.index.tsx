import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  Users,
  FileText,
  Brain,
  AlertTriangle,
  Package,
  Gavel,
  ArrowRight,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { ContradictionCard } from "@/components/contradiction-card";
import {
  getCaseInfoFn,
  getWitnessesFn,
  getStatementsFn,
  getEvidenceFn,
  getContradictionsFn,
} from "@/lib/api";

const caseInfoQueryOptions = queryOptions({
  queryKey: ["caseInfo"],
  queryFn: () => getCaseInfoFn(),
});

const witnessesQueryOptions = queryOptions({
  queryKey: ["witnesses"],
  queryFn: () => getWitnessesFn(),
});

const statementsQueryOptions = queryOptions({
  queryKey: ["statements"],
  queryFn: () => getStatementsFn(),
});

const evidenceQueryOptions = queryOptions({
  queryKey: ["evidence"],
  queryFn: () => getEvidenceFn(),
});

const contradictionsQueryOptions = queryOptions({
  queryKey: ["contradictions"],
  queryFn: () => getContradictionsFn(),
});

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Overview · CrossLens" },
      { name: "description", content: "Trial-day overview: active case, witnesses, evidence and top contradictions." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(caseInfoQueryOptions);
    await context.queryClient.ensureQueryData(witnessesQueryOptions);
    await context.queryClient.ensureQueryData(statementsQueryOptions);
    await context.queryClient.ensureQueryData(evidenceQueryOptions);
    await context.queryClient.ensureQueryData(contradictionsQueryOptions);
  },
  component: OverviewPage,
  errorComponent: ({ error }) => <div className="p-8 text-destructive">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-8">No case data found.</div>,
});

function OverviewPage() {
  const { data: caseInfo } = useSuspenseQuery(caseInfoQueryOptions);
  const { data: witnesses } = useSuspenseQuery(witnessesQueryOptions);
  const { data: statements } = useSuspenseQuery(statementsQueryOptions);
  const { data: evidence } = useSuspenseQuery(evidenceQueryOptions);
  const { data: contradictions } = useSuspenseQuery(contradictionsQueryOptions);

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col justify-between gap-4 rounded-2xl border bg-gradient-to-br from-primary-soft/40 via-card to-card p-6 shadow-sm md:flex-row md:items-center"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Gavel className="h-3.5 w-3.5" /> Active case
          </div>
          <h1 className="mt-2 font-display text-4xl">{caseInfo.caption}</h1>
          <div className="mt-1 text-sm text-muted-foreground">
            {caseInfo.docket} · {caseInfo.court} · {caseInfo.judge} · {caseInfo.charge}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
            {caseInfo.status}
          </span>
          <span className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
            Next: {caseInfo.nextHearing}
          </span>
          <Link
            to="/dashboard/live"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Enter courtroom <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Active cases" value={4} icon={Gavel} hint="1 in trial" />
        <StatCard label="Witnesses" value={witnesses.length} icon={Users} hint="tracked" />
        <StatCard label="Documents indexed" value={38} icon={FileText} hint="12,412 pages" />
        <StatCard label="Statements stored" value={statements.length * 42} icon={Brain} hint="graph nodes" />
        <StatCard label="Contradictions" value={contradictions.length} tone="warning" icon={AlertTriangle} hint="flagged today" />
        <StatCard label="Evidence linked" value={evidence.length} tone="success" icon={Package} hint="exhibits" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Top contradictions</h2>
            <Link
              to="/dashboard/contradictions"
              className="text-sm text-primary hover:underline"
            >
              View all →
            </Link>
          </div>
          {contradictions.slice(0, 2).map((c) => (
            <ContradictionCard key={c.id} contradiction={c} />
          ))}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-display text-lg">Witness confidence</h3>
            <p className="text-xs text-muted-foreground">Reliability score based on prior consistency</p>
            <ul className="mt-4 space-y-3">
              {witnesses.map((w) => (
                <li key={w.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{w.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(w.reliability * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${w.reliability * 100}%` }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{w.role}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-display text-lg">Today at a glance</h3>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 rounded-full bg-primary" />
                <div>
                  <div className="font-medium">Cross-examination of D. Reyes</div>
                  <div className="text-xs text-muted-foreground">09:30 AM · Dept. 7</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 rounded-full bg-warning" />
                <div>
                  <div className="font-medium">Ofc. Whitaker recalled</div>
                  <div className="text-xs text-muted-foreground">01:30 PM · Rebuttal</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 rounded-full bg-success" />
                <div>
                  <div className="font-medium">Forensic report re-index complete</div>
                  <div className="text-xs text-muted-foreground">Auto-linked to Exhibit C</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
