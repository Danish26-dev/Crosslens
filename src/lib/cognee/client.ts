// Cognee Cloud client — the four hackathon primitives:
//   remember(text|file) → add + cognify
//   recall(query)       → search
//   improve()           → cognify (a.k.a. memify)
//   forget(dataset)     → delete dataset
//
// Every function is stateless and Workers-safe.

const DEFAULT_BASE_URL = "https://api.cognee.ai";

export function getCogneeBaseUrl(): string {
  return (process.env.COGNEE_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
}

function getApiKey(): string {
  const key = process.env.COGNEE_API_KEY;
  if (!key) throw new Error("COGNEE_API_KEY is not set");
  return key;
}

function authHeaders(json = false): Record<string, string> {
  // Cognee Cloud uses X-Api-Key (see docs.cognee.ai/api-reference/introduction).
  const h: Record<string, string> = { "X-Api-Key": getApiKey() };
  if (json) h["Content-Type"] = "application/json";
  return h;
}


async function assertOk(response: Response, op: string) {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Cognee ${op} error ${response.status}: ${body.slice(0, 500)}`);
  }
}

// ---------- Low-level primitives (kept for internal use) ----------

export async function cogneeAddText(text: string, datasetName: string) {
  const form = new FormData();
  const blob = new Blob([text], { type: "text/plain" });
  form.append("data", blob, "document.txt");
  form.append("datasetName", datasetName);

  const response = await fetch(`${getCogneeBaseUrl()}/api/v1/add`, {
    method: "POST",
    headers: authHeaders(),
    body: form,
  });
  await assertOk(response, "add");
  return response.json();
}

export async function cogneeAddFile(file: File, datasetName: string) {
  const form = new FormData();
  form.append("data", file, file.name);
  form.append("datasetName", datasetName);

  const response = await fetch(`${getCogneeBaseUrl()}/api/v1/add`, {
    method: "POST",
    headers: authHeaders(),
    body: form,
  });
  await assertOk(response, "add(file)");
  return response.json();
}

export async function cogneeCognify(datasetName: string) {
  const response = await fetch(`${getCogneeBaseUrl()}/api/v1/cognify`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({
      datasets: [datasetName],
      run_in_background: false,
    }),
  });
  await assertOk(response, "cognify");
  return response.json();
}

export type CogneeSearchResult = {
  search_result: unknown;
  dataset_id: string | null;
  dataset_name: string | null;
};

export async function cogneeSearch(
  query: string,
  datasetName: string,
  options: { topK?: number; searchType?: string } = {},
): Promise<CogneeSearchResult[]> {
  const response = await fetch(`${getCogneeBaseUrl()}/api/v1/search`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({
      query,
      search_type: options.searchType ?? "RAG_COMPLETION",
      datasets: [datasetName],
      top_k: options.topK ?? 8,
      includeReferences: true,
    }),
  });
  await assertOk(response, "search");
  return (await response.json()) as CogneeSearchResult[];
}

// ---------- Hackathon primitives ----------

/**
 * `cognee.remember(...)` — commit a fact or a file to memory and immediately
 * cognify it so the knowledge graph updates.
 */
export async function cogneeRemember(
  input: { text: string; dataset: string } | { file: File; dataset: string },
): Promise<{ dataset: string; kind: "text" | "file" }> {
  if ("file" in input) {
    await cogneeAddFile(input.file, input.dataset);
    await cogneeCognify(input.dataset);
    return { dataset: input.dataset, kind: "file" };
  }
  await cogneeAddText(input.text, input.dataset);
  await cogneeCognify(input.dataset);
  return { dataset: input.dataset, kind: "text" };
}

/**
 * `cognee.recall(...)` — ask the agent's memory across sessions.
 */
export async function cogneeRecall(
  query: string,
  dataset: string,
  options: { topK?: number; searchType?: string } = {},
): Promise<{ answer: string; chunks: string[]; raw: CogneeSearchResult[] }> {
  const raw = await cogneeSearch(query, dataset, options);
  const chunks = raw
    .map((r) => (typeof r.search_result === "string" ? r.search_result : JSON.stringify(r.search_result)))
    .filter(Boolean);
  return { answer: chunks[0] ?? "", chunks, raw };
}

/**
 * `cognee.improve()` — re-run cognify to let the memory get smarter over time
 * (a.k.a. memify). Safe to call repeatedly.
 */
export async function cogneeImprove(dataset: string) {
  return cogneeCognify(dataset);
}

/**
 * `cognee.forget(dataset=...)` — surgically drop a dataset.
 * Cognee exposes a delete endpoint on the datasets resource.
 */
export async function cogneeForget(dataset: string) {
  const url = `${getCogneeBaseUrl()}/api/v1/datasets/${encodeURIComponent(dataset)}`;
  const response = await fetch(url, { method: "DELETE", headers: authHeaders() });
  // Some deployments return 404 if the dataset never existed — treat as success.
  if (response.status === 404) return { dataset, deleted: false };
  await assertOk(response, "forget");
  return { dataset, deleted: true };
}
