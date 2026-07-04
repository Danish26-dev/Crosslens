// OpenRouter client for contradiction detection and reasoning.
// Uses standard fetch. No proprietary dependencies.

export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

const DEFAULT_MODEL = "openai/gpt-4o-mini";

export type ContradictionAnalysisResult = {
  found: boolean;
  confidence: number; // 0-1
  severity: "high" | "medium" | "low";
  reason: string;
  priorStatementId?: string;
  priorStatementText?: string;
  priorDocument?: string;
  priorPage?: number;
  priorLine?: number;
};

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not set");
  return key;
}

export async function analyzeContradiction(
  utterance: string,
  priorStatements: Array<{
    id: string;
    text: string;
    witnessName: string;
    document: string;
    page?: number;
    line?: number;
  }>,
  options: { model?: string } = {},
): Promise<ContradictionAnalysisResult> {
  const model = options.model ?? DEFAULT_MODEL;

  const systemPrompt = `You are a legal impeachment analyst. Given a new courtroom utterance and a list of prior sworn statements, determine whether the new utterance contradicts any prior statement. If a contradiction exists, identify the prior statement, explain the contradiction, and rate confidence and severity.

Respond strictly as JSON matching this schema:
{
  "found": boolean,
  "confidence": number between 0 and 1,
  "severity": "high" | "medium" | "low",
  "reason": "string explaining the contradiction",
  "priorStatementId": "id of the prior statement (if found)",
  "priorStatementText": "text of the prior statement (if found)",
  "priorDocument": "document name",
  "priorPage": number or null,
  "priorLine": number or null
}

If no contradiction is found, return found=false and confidence=0. Be conservative: only flag real contradictions, not minor paraphrasing.`;

  const context = priorStatements
    .map(
      (s) =>
        `ID: ${s.id}\nWitness: ${s.witnessName}\nDocument: ${s.document} (p.${s.page ?? "?"}, ln.${s.line ?? "?"})\nText: "${s.text}"`,
    )
    .join("\n\n---\n\n");

  const userPrompt = `NEW UTTERANCE: "${utterance}"\n\nPRIOR STATEMENTS:\n\n${context}`;

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.APP_URL ?? "https://crosslens.local",
      "X-Title": "CrossLens",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${body}`);
  }

  const json = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  const content = json.choices[0]?.message?.content ?? "{}";

  try {
    const parsed = JSON.parse(content) as ContradictionAnalysisResult;
    return {
      found: Boolean(parsed.found),
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0)),
      severity: ["high", "medium", "low"].includes(parsed.severity) ? parsed.severity : "low",
      reason: parsed.reason || "",
      priorStatementId: parsed.priorStatementId,
      priorStatementText: parsed.priorStatementText,
      priorDocument: parsed.priorDocument,
      priorPage: parsed.priorPage ? Number(parsed.priorPage) : undefined,
      priorLine: parsed.priorLine ? Number(parsed.priorLine) : undefined,
    };
  } catch {
    return { found: false, confidence: 0, severity: "low", reason: "" };
  }
}

export async function summarizeForCognee(text: string, options: { model?: string } = {}) {
  const model = options.model ?? DEFAULT_MODEL;

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.APP_URL ?? "https://crosslens.local",
      "X-Title": "CrossLens",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "Summarize the following legal document in 3-5 sentences. Preserve names, dates, locations, and key factual claims. Keep it concise and factual.",
        },
        { role: "user", content: text.slice(0, 12000) },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${body}`);
  }

  const json = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return json.choices[0]?.message?.content ?? "";
}
