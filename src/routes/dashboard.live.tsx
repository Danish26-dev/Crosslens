import { createFileRoute } from "@tanstack/react-router";
import { LiveTranscript } from "@/components/live-transcript";

export const Route = createFileRoute("/dashboard/live")({
  head: () => ({
    meta: [
      { title: "Live Testimony · CrossLens" },
      { name: "description", content: "Real-time transcript with sub-second contradiction detection." },
    ],
  }),
  component: LivePage,
});

function LivePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">Live testimony</div>
        <h1 className="mt-1 font-display text-4xl">Cross-examination console</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Enter the next question or witness answer. CrossLens streams the transcript, searches
          persistent memory across every deposition and exhibit, and surfaces impeachment cards in
          real time.
        </p>
      </div>
      <LiveTranscript />
    </div>
  );
}
