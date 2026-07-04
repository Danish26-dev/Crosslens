import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { CaseTimeline } from "@/components/case-timeline";
import { getTimelineFn } from "@/lib/api";

const timelineQueryOptions = queryOptions({
  queryKey: ["timeline"],
  queryFn: () => getTimelineFn(),
});

export const Route = createFileRoute("/dashboard/timeline")({
  head: () => ({
    meta: [
      { title: "Timeline · CrossLens" },
      { name: "description", content: "Interactive case chronology from first response to trial." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(timelineQueryOptions);
  },
  component: TimelinePage,
  errorComponent: ({ error }) => <div className="p-8 text-destructive">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-8">No timeline events found.</div>,
});

function TimelinePage() {
  const { data: timeline } = useSuspenseQuery(timelineQueryOptions);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 md:p-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">Timeline</div>
        <h1 className="mt-1 font-display text-4xl">Case chronology</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Reconstructed from every document CrossLens has indexed.
        </p>
      </div>
      <CaseTimeline events={timeline} />
    </div>
  );
}
