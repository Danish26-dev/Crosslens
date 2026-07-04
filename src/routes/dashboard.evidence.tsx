import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { EvidencePanel } from "@/components/evidence-panel";
import { getEvidenceFn, getWitnessesFn, getStatementsFn, uploadDocument } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const evidenceQueryOptions = queryOptions({
  queryKey: ["evidence"],
  queryFn: () => getEvidenceFn(),
});

const witnessesQueryOptions = queryOptions({
  queryKey: ["witnesses"],
  queryFn: () => getWitnessesFn(),
});

const statementsQueryOptions = queryOptions({
  queryKey: ["statements"],
  queryFn: () => getStatementsFn(),
});

export const Route = createFileRoute("/dashboard/evidence")({
  head: () => ({
    meta: [
      { title: "Evidence · CrossLens" },
      { name: "description", content: "Linked exhibits with related statements and connected witnesses." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(evidenceQueryOptions);
    await context.queryClient.ensureQueryData(witnessesQueryOptions);
    await context.queryClient.ensureQueryData(statementsQueryOptions);
  },
  component: EvidencePage,
  errorComponent: ({ error }) => <div className="p-8 text-destructive">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-8">No evidence found.</div>,
});

function UploadButton() {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    const tId = toast.loading(`Uploading ${file.name}…`);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await uploadDocument({ data: form });
      toast.success(`Indexed ${res.name} (${res.status})`, { id: tId });
      await qc.invalidateQueries();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed", { id: tId });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md,.pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />
      <Button onClick={() => inputRef.current?.click()} disabled={busy}>
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
        Upload document
      </Button>
    </>
  );
}

function EvidencePage() {
  const { data: evidence } = useSuspenseQuery(evidenceQueryOptions);
  const { data: witnesses } = useSuspenseQuery(witnessesQueryOptions);
  const { data: statements } = useSuspenseQuery(statementsQueryOptions);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 md:p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Evidence</div>
          <h1 className="mt-1 font-display text-4xl">Exhibit intelligence</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Every exhibit auto-links to the statements it supports or refutes.
          </p>
        </div>
        <UploadButton />
      </div>
      <EvidencePanel evidence={evidence} witnesses={witnesses} statements={statements} />
    </div>
  );
}

