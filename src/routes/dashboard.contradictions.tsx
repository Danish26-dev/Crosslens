import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ContradictionCard } from "@/components/contradiction-card";
import { getContradictionsFn } from "@/lib/api";

const contradictionsQueryOptions = queryOptions({
  queryKey: ["contradictions"],
  queryFn: () => getContradictionsFn(),
});

export const Route = createFileRoute("/dashboard/contradictions")({
  head: () => ({
    meta: [
      { title: "Contradictions · CrossLens" },
      { name: "description", content: "All impeachment opportunities detected across witnesses and documents." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(contradictionsQueryOptions);
  },
  component: ContradictionsPage,
  errorComponent: ({ error }) => <div className="p-8 text-destructive">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-8">No contradictions found.</div>,
});

function ContradictionsPage() {
  const { data: contradictions } = useSuspenseQuery(contradictionsQueryOptions);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 md:p-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">Contradictions</div>
        <h1 className="mt-1 font-display text-4xl">Impeachment feed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ranked by confidence and severity. Click any card to jump to source citation.
        </p>
      </div>
      <div className="space-y-5">
        {contradictions.map((c) => (
          <ContradictionCard key={c.id} contradiction={c} />
        ))}
      </div>
    </div>
  );
}
