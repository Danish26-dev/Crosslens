import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/cognee-check")({
  server: {
    handlers: {
      GET: async () => {
        const base = (process.env.COGNEE_BASE_URL || "https://api.cognee.ai").replace(/\/$/, "");
        const key = process.env.COGNEE_API_KEY;
        const dataset = process.env.COGNEE_DATASET || "crosslens";
        if (!key) {
          return Response.json({ ok: false, error: "COGNEE_API_KEY not set" }, { status: 500 });
        }

        const attempts: Record<string, Record<string, string>> = {
          "X-Api-Key": { "X-Api-Key": key },
          "Bearer": { Authorization: `Bearer ${key}` },
          "api-key": { "api-key": key },
        };

        async function probe(path: string) {
          const results: Record<string, unknown> = {};
          for (const [label, hdr] of Object.entries(attempts)) {
            try {
              const r = await fetch(`${base}${path}`, { headers: hdr });
              const text = await r.text();
              let body: unknown;
              try { body = JSON.parse(text); } catch { body = text.slice(0, 200); }
              results[label] = { status: r.status, body };
            } catch (e) {
              results[label] = { error: String(e) };
            }
          }
          return results;
        }

        const datasetsRes = await fetch(`${base}/api/v1/datasets`, { headers: { "X-Api-Key": key } });
        const datasets = (await datasetsRes.json()) as Array<{ id: string; name: string }>;
        const target = datasets.find((d) => d.name === dataset);

        let data: unknown = "dataset not found";
        if (target) {
          const dr = await fetch(`${base}/api/v1/datasets/${target.id}/data`, { headers: { "X-Api-Key": key } });
          const txt = await dr.text();
          try { data = JSON.parse(txt); } catch { data = txt.slice(0, 500); }
        }

        return Response.json({
          base,
          apiKeyLength: key.length,
          apiKeyPrefix: key.slice(0, 6),
          configuredDataset: dataset,
          datasets,
          targetDatasetId: target?.id ?? null,
          filesInDataset: data,
        }, { headers: { "cache-control": "no-store" } });

      },
    },
  },
});

