import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { getCasesFn, createCaseFn } from "@/lib/api";
import { Gavel, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const casesQueryOptions = queryOptions({
  queryKey: ["cases"],
  queryFn: () => getCasesFn(),
});

export const Route = createFileRoute("/dashboard/cases")({
  head: () => ({
    meta: [
      { title: "Cases · CrossLens" },
      { name: "description", content: "All active matters indexed by CrossLens." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(casesQueryOptions);
  },
  component: CasesPage,
  errorComponent: ({ error }) => <div className="p-8 text-destructive">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-8">No cases found.</div>,
});

function NewCaseDialog() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    caption: "",
    docket: "",
    court: "",
    judge: "",
    charge: "",
    attorney: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.caption.trim()) return;
    setBusy(true);
    try {
      await createCaseFn({ data: form });
      toast.success(`Case created: ${form.caption}`);
      setForm({ caption: "", docket: "", court: "", judge: "", charge: "", attorney: "" });
      setOpen(false);
      await qc.invalidateQueries({ queryKey: ["cases"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create case");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
          New case
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New case</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="caption">Caption *</Label>
            <Input
              id="caption"
              required
              placeholder="State v. Doe"
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="docket">Docket</Label>
              <Input
                id="docket"
                placeholder="2024-CR-00001"
                value={form.docket}
                onChange={(e) => setForm({ ...form, docket: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="court">Court</Label>
              <Input
                id="court"
                placeholder="Superior Court"
                value={form.court}
                onChange={(e) => setForm({ ...form, court: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="judge">Judge</Label>
              <Input
                id="judge"
                value={form.judge}
                onChange={(e) => setForm({ ...form, judge: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="attorney">Attorney</Label>
              <Input
                id="attorney"
                value={form.attorney}
                onChange={(e) => setForm({ ...form, attorney: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="charge">Charge / Claim</Label>
            <Input
              id="charge"
              value={form.charge}
              onChange={(e) => setForm({ ...form, charge: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !form.caption.trim()}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CasesPage() {
  const { data: cases } = useSuspenseQuery(casesQueryOptions);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-8">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Cases</div>
          <h1 className="mt-1 font-display text-4xl">Matter workspace</h1>
        </div>
        <NewCaseDialog />
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Caption</th>
              <th className="px-5 py-3 text-left font-medium">Docket</th>
              <th className="px-5 py-3 text-left font-medium">Charge / Claim</th>
              <th className="px-5 py-3 text-left font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Docs</th>
              <th className="px-5 py-3 text-right font-medium">Contradictions</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c.id} className="border-t transition-colors hover:bg-muted/30">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`grid size-8 place-items-center rounded-md ${
                        c.active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Gavel className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{c.caption}</div>
                      <div className="text-xs text-muted-foreground">{c.court}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{c.docket}</td>
                <td className="px-5 py-4 text-foreground/80">{c.charge}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                      c.active
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-border bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right tabular-nums">{c.documents}</td>
                <td className="px-5 py-4 text-right tabular-nums">
                  {c.contradictions > 0 ? (
                    <span className="rounded-md bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning-foreground">
                      {c.contradictions}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
