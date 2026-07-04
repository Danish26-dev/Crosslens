import { createFileRoute } from "@tanstack/react-router";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({
    meta: [
      { title: "Settings · CrossLens" },
      { name: "description", content: "Workspace settings and integrations." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 md:p-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">Settings</div>
        <h1 className="mt-1 font-display text-4xl">Workspace</h1>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-display text-xl">Firm profile</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Firm name</Label>
            <Input defaultValue="Chen & Associates, LLP" />
          </div>
          <div className="space-y-1.5">
            <Label>Lead attorney</Label>
            <Input defaultValue="M. Chen" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-display text-xl">Memory engine</h3>
        <div className="mt-4 space-y-4">
          {[
            { label: "Auto-index new uploads", d: "Chunk, embed, and link within seconds of upload." },
            { label: "Real-time contradiction alerts", d: "Push impeachment cards to the live transcript." },
            { label: "Cross-case reasoning", d: "Search prior matters for related expert testimony." },
          ].map((o, i) => (
            <div key={o.label} className="flex items-center justify-between border-t pt-4 first:border-0 first:pt-0">
              <div>
                <div className="text-sm font-semibold">{o.label}</div>
                <div className="text-xs text-muted-foreground">{o.d}</div>
              </div>
              <Switch defaultChecked={i !== 2} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-display text-xl">Integrations</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {["Cognee", "OpenRouter", "ChromaDB", "Whisper", "OpenAI", "Gemini"].map((s) => (
            <div key={s} className="flex items-center justify-between rounded-lg border bg-background p-3 text-sm">
              <span className="font-medium">{s}</span>
              <span className="rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[11px] text-success">
                Ready
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
