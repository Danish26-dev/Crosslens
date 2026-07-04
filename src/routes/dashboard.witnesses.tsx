import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { WitnessGraph } from "@/components/witness-graph";
import { getWitnessesFn, getStatementsFn, getEvidenceFn } from "@/lib/api";

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

export const Route = createFileRoute("/dashboard/witnesses")({
  head: () => ({
    meta: [
      { title: "Witnesses · CrossLens" },
      { name: "description", content: "Witness memory graph with statement and evidence relationships." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(witnessesQueryOptions);
    await context.queryClient.ensureQueryData(statementsQueryOptions);
    await context.queryClient.ensureQueryData(evidenceQueryOptions);
  },
  component: WitnessesPage,
  errorComponent: ({ error }) => <div className="p-8 text-destructive">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-8">No witnesses found.</div>,
});

function WitnessesPage() {
  const { data: witnesses } = useSuspenseQuery(witnessesQueryOptions);
  const { data: statements } = useSuspenseQuery(statementsQueryOptions);
  const { data: evidence } = useSuspenseQuery(evidenceQueryOptions);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">Witnesses</div>
        <h1 className="mt-1 font-display text-4xl">Memory graph</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          A live view of every witness, every statement they have made, and the exhibits those
          statements attach to.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {witnesses.map((w) => (
          <div key={w.id} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div
                className="grid size-10 place-items-center rounded-full text-sm font-semibold text-white"
                style={{ background: w.avatarColor }}
              >
                {w.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <div className="font-semibold">{w.name}</div>
                <div className="text-xs text-muted-foreground">{w.role}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md bg-muted/40 p-2">
                <div className="text-muted-foreground">Statements</div>
                <div className="font-display text-xl">{w.statementCount}</div>
              </div>
              <div className="rounded-md bg-muted/40 p-2">
                <div className="text-muted-foreground">Reliability</div>
                <div className="font-display text-xl">{Math.round(w.reliability * 100)}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <WitnessGraph witnesses={witnesses} statements={statements} evidence={evidence} />
    </div>
  );
}
