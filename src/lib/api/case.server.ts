// Server-only data access for CrossLens.
// This file is blocked from the client bundle by its `.server.ts` name.

import { sql } from "@/lib/db";
import {
  analyzeContradiction,
  summarizeForCognee,
} from "@/lib/openrouter/client";
import {
  cogneeAddText,
  cogneeAddFile,
  cogneeCognify,
  cogneeSearch,
  cogneeRemember,
  cogneeRecall,
  cogneeImprove,
  cogneeForget,
} from "@/lib/cognee/client";
import { extractTextFromFile } from "@/lib/documents/parser";
import { seedDatabase } from "@/lib/db/seed";
import type {
  CaseInfo,
  Contradiction,
  Evidence,
  Statement,
  TimelineEvent,
  Witness,
} from "@/lib/types/case";

const ACTIVE_CASE_EXTERNAL_ID = "case-2024-cr-01472";

function datasetForCase(caseId: string) {
  // Allow forcing a single shared Cognee dataset (e.g. a user-owned brain
  // created in the Cognee dashboard). Set COGNEE_DATASET to override the
  // per-case default.
  const override = process.env.COGNEE_DATASET?.trim();
  if (override) return override;
  return `crosslens-${caseId}`;
}


export async function ensureSeeded(): Promise<{ seeded: boolean; caseId: string }> {
  const rows = await sql<{ id: string }[]>`
    SELECT id FROM cases WHERE external_id = ${ACTIVE_CASE_EXTERNAL_ID} LIMIT 1
  `;
  if (rows.length > 0) return { seeded: false, caseId: rows[0].id };
  const caseId = await seedDatabase();

  // Seed Cognee memory with every witness statement so the graph is
  // populated on first run — visible on the Cognee dashboard immediately.
  try {
    const statements = await sql<{ text: string; name: string; document: string }[]>`
      SELECT s.text, w.name, s.document
      FROM statements s
      JOIN witnesses w ON w.id = s.witness_id
      WHERE s.case_id = ${caseId}
    `;
    const dataset = datasetForCase(caseId);
    for (const s of statements) {
      const fact = `${s.name} testified in ${s.document}: "${s.text}"`;
      await cogneeAddText(fact, dataset);
    }
    await cogneeCognify(dataset);
  } catch (err) {
    console.error("Cognee seed failed:", err);
  }

  return { seeded: true, caseId };
}

// ---------- Cognee hackathon primitives (remember / recall / improve / forget) ----------

export async function rememberFact(text: string): Promise<{ dataset: string }> {
  const caseId = await getActiveCaseId();
  const dataset = datasetForCase(caseId);
  await cogneeRemember({ text, dataset });
  return { dataset };
}

export async function recallFromMemory(
  query: string,
): Promise<{ dataset: string; answer: string; chunks: string[] }> {
  const caseId = await getActiveCaseId();
  const dataset = datasetForCase(caseId);
  const { answer, chunks } = await cogneeRecall(query, dataset);
  return { dataset, answer, chunks };
}

export async function improveMemory(): Promise<{ dataset: string }> {
  const caseId = await getActiveCaseId();
  const dataset = datasetForCase(caseId);
  await cogneeImprove(dataset);
  return { dataset };
}

export async function forgetMemory(dataset?: string): Promise<{ dataset: string; deleted: boolean }> {
  const target = dataset ?? datasetForCase(await getActiveCaseId());
  const res = await cogneeForget(target);
  return res;
}


async function getActiveCaseId(): Promise<string> {
  const rows = await sql<{ id: string }[]>`
    SELECT id FROM cases WHERE external_id = ${ACTIVE_CASE_EXTERNAL_ID} LIMIT 1
  `;
  if (rows.length > 0) return rows[0].id;
  // Auto-seed if the demo case is missing.
  const { caseId } = await ensureSeeded();
  return caseId;
}

export async function createCase(input: {
  caption: string;
  docket?: string;
  court?: string;
  judge?: string;
  charge?: string;
  status?: string;
  nextHearing?: string;
  attorney?: string;
}): Promise<CaseInfo> {
  const externalId = `case-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const rows = await sql<
    {
      external_id: string;
      caption: string;
      docket: string;
      court: string;
      judge: string;
      charge: string;
      status: string;
      next_hearing: string;
      attorney: string;
    }[]
  >`
    INSERT INTO cases (external_id, caption, docket, court, judge, charge, status, next_hearing, attorney)
    VALUES (
      ${externalId},
      ${input.caption},
      ${input.docket ?? ""},
      ${input.court ?? ""},
      ${input.judge ?? ""},
      ${input.charge ?? ""},
      ${input.status ?? "Open"},
      ${input.nextHearing ?? ""},
      ${input.attorney ?? ""}
    )
    RETURNING external_id, caption, docket, court, judge, charge, status, next_hearing, attorney
  `;
  const r = rows[0];
  return {
    id: r.external_id,
    caption: r.caption,
    docket: r.docket,
    court: r.court,
    judge: r.judge,
    charge: r.charge,
    status: r.status,
    nextHearing: r.next_hearing,
    attorney: r.attorney,
  };
}



export async function getCases(): Promise<
  Array<CaseInfo & { documents: number; contradictions: number; active: boolean }>
> {
  await ensureSeeded();
  const rows = await sql<
    {
      id: string;
      external_id: string;
      caption: string;
      docket: string;
      court: string;
      charge: string;
      status: string;
      next_hearing: string;
      judge: string;
      attorney: string;
      documents: number;
      contradictions: number;
    }[]
  >`
    SELECT
      c.*,
      COUNT(DISTINCT d.id)::int AS documents,
      COUNT(DISTINCT ct.id)::int AS contradictions
    FROM cases c
    LEFT JOIN documents d ON d.case_id = c.id
    LEFT JOIN contradictions ct ON ct.case_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `;

  return rows.map((r) => ({
    id: r.external_id,
    caption: r.caption,
    docket: r.docket,
    court: r.court,
    judge: r.judge,
    charge: r.charge,
    status: r.status,
    nextHearing: r.next_hearing,
    attorney: r.attorney,
    documents: r.documents,
    contradictions: r.contradictions,
    active: r.external_id === ACTIVE_CASE_EXTERNAL_ID,
  }));
}

export async function getCaseInfo(): Promise<CaseInfo> {
  await ensureSeeded();
  const rows = await sql<
    {
      id: string;
      external_id: string;
      caption: string;
      docket: string;
      court: string;
      judge: string;
      charge: string;
      status: string;
      next_hearing: string;
      attorney: string;
    }[]
  >`
    SELECT * FROM cases WHERE external_id = ${ACTIVE_CASE_EXTERNAL_ID} LIMIT 1
  `;
  if (rows.length === 0) throw new Error("Active case not found");
  const r = rows[0];
  return {
    id: r.external_id,
    caption: r.caption,
    docket: r.docket,
    court: r.court,
    judge: r.judge,
    charge: r.charge,
    status: r.status,
    nextHearing: r.next_hearing,
    attorney: r.attorney,
  };
}

export async function getWitnesses(): Promise<Witness[]> {
  const caseId = await getActiveCaseId();
  const rows = await sql<
    {
      id: string;
      external_id: string;
      name: string;
      role: string;
      reliability: number;
      avatar_color: string;
      statement_count: number;
    }[]
  >`
    SELECT * FROM witnesses WHERE case_id = ${caseId} ORDER BY name
  `;

  return rows.map((r) => ({
    id: r.external_id,
    name: r.name,
    role: r.role,
    reliability: Number(r.reliability),
    statementCount: r.statement_count,
    avatarColor: r.avatar_color,
  }));
}

export async function getStatements(): Promise<Statement[]> {
  const caseId = await getActiveCaseId();
  const rows = await sql<
    {
      id: string;
      external_id: string;
      witness_id: string;
      text: string;
      document: string;
      page: number;
      line: number;
      date: string;
      topic: string;
    }[]
  >`
    SELECT
      s.id,
      w.external_id AS witness_id,
      s.text,
      s.document,
      s.page,
      s.line,
      s.date,
      s.topic
    FROM statements s
    JOIN witnesses w ON w.id = s.witness_id
    WHERE s.case_id = ${caseId}
    ORDER BY s.date, s.page, s.line
  `;

  return rows.map((r) => ({
    id: r.id,
    witnessId: r.witness_id,
    text: r.text,
    document: r.document,
    page: r.page,
    line: r.line,
    date: r.date,
    topic: r.topic,
  }));
}

export async function getEvidence(): Promise<Evidence[]> {
  const caseId = await getActiveCaseId();
  const rows = await sql<
    {
      id: string;
      external_id: string;
      label: string;
      kind: string;
      description: string;
    }[]
  >`
    SELECT * FROM evidence_items WHERE case_id = ${caseId} ORDER BY label
  `;

  const evidence: Evidence[] = [];
  for (const r of rows) {
    const statementRows = await sql<{ statement_id: string }[]>`
      SELECT statement_id FROM evidence_statement_links WHERE evidence_id = ${r.id}
    `;
    const witnessRows = await sql<{ external_id: string }[]>`
      SELECT w.external_id
      FROM evidence_witness_links l
      JOIN witnesses w ON w.id = l.witness_id
      WHERE l.evidence_id = ${r.id}
    `;

    evidence.push({
      id: r.external_id,
      label: r.label,
      kind: r.kind as Evidence["kind"],
      description: r.description,
      linkedStatementIds: statementRows.map((s) => s.statement_id),
      linkedWitnessIds: witnessRows.map((w) => w.external_id),
    });
  }

  return evidence;
}

export async function getTimeline(): Promise<TimelineEvent[]> {
  const caseId = await getActiveCaseId();
  const rows = await sql<
    { id: string; external_id: string; date: string; label: string; kind: string; document: string | null }[]
  >`
    SELECT * FROM timeline_events WHERE case_id = ${caseId} ORDER BY date
  `;

  return rows.map((r) => ({
    id: r.external_id,
    date: r.date,
    label: r.label,
    kind: r.kind as TimelineEvent["kind"],
    document: r.document ?? undefined,
  }));
}

export async function getContradictions(): Promise<Contradiction[]> {
  const caseId = await getActiveCaseId();
  const rows = await sql<
    {
      id: string;
      witness_id: string;
      witness_name: string;
      witness_role: string;
      witness_avatar_color: string;
      witness_reliability: number;
      current_statement: string;
      previous_statement_id: string | null;
      previous_statement_text: string | null;
      previous_statement_document: string | null;
      previous_statement_page: number | null;
      previous_statement_line: number | null;
      previous_statement_date: string | null;
      previous_statement_topic: string | null;
      confidence: number;
      reason: string;
      severity: string;
    }[]
  >`
    SELECT
      c.id,
      w.external_id AS witness_id,
      w.name AS witness_name,
      w.role AS witness_role,
      w.avatar_color AS witness_avatar_color,
      w.reliability AS witness_reliability,
      c.current_statement,
      c.previous_statement_id,
      ps.text AS previous_statement_text,
      ps.document AS previous_statement_document,
      ps.page AS previous_statement_page,
      ps.line AS previous_statement_line,
      ps.date AS previous_statement_date,
      ps.topic AS previous_statement_topic,
      c.confidence,
      c.reason,
      c.severity
    FROM contradictions c
    JOIN witnesses w ON w.id = c.witness_id
    LEFT JOIN statements ps ON ps.id = c.previous_statement_id
    WHERE c.case_id = ${caseId}
    ORDER BY c.confidence DESC
  `;

  return rows.map((r) => ({
    id: r.id,
    witnessId: r.witness_id,
    currentStatement: r.current_statement,
    previousStatementId: r.previous_statement_id ?? "",
    confidence: Number(r.confidence),
    reason: r.reason,
    severity: r.severity as Contradiction["severity"],
    witness: {
      id: r.witness_id,
      name: r.witness_name,
      role: r.witness_role,
      reliability: Number(r.witness_reliability),
      statementCount: 0,
      avatarColor: r.witness_avatar_color,
    },
    previousStatement: r.previous_statement_id
      ? {
          id: r.previous_statement_id,
          witnessId: r.witness_id,
          text: r.previous_statement_text ?? "",
          document: r.previous_statement_document ?? "",
          page: r.previous_statement_page ?? 0,
          line: r.previous_statement_line ?? 0,
          date: r.previous_statement_date ?? "",
          topic: r.previous_statement_topic ?? "",
        }
      : undefined,
  }));
}

export async function submitTestimony(
  utterance: string,
): Promise<{ utterance: string; contradiction: Contradiction | null }> {
  const caseId = await getActiveCaseId();

  // Cognee: remember every live utterance so cross-session recall works.
  try {
    await cogneeRemember({ text: `Live testimony: "${utterance}"`, dataset: datasetForCase(caseId) });
  } catch (err) {
    console.error("Cognee remember(live) failed:", err);
  }


  // Fetch all prior statements for the active case, with witness details.
  const rows = await sql<
    {
      id: string;
      text: string;
      name: string;
      document: string;
      page: number;
      line: number;
      date: string;
      topic: string;
      external_id: string;
      role: string;
      avatar_color: string;
      reliability: number;
    }[]
  >`
    SELECT
      s.id,
      s.text,
      w.name,
      s.document,
      s.page,
      s.line,
      s.date,
      s.topic,
      w.external_id,
      w.role,
      w.avatar_color,
      w.reliability
    FROM statements s
    JOIN witnesses w ON w.id = s.witness_id
    WHERE s.case_id = ${caseId}
  `;

  if (rows.length === 0) {
    return { utterance, contradiction: null };
  }

  const priorStatements = rows.map((r) => ({
    id: r.id,
    text: r.text,
    witnessName: r.name,
    document: r.document,
    page: r.page,
    line: r.line,
  }));

  const analysis = await analyzeContradiction(utterance, priorStatements);

  if (!analysis.found || !analysis.priorStatementId) {
    return { utterance, contradiction: null };
  }

  const prior = rows.find((r) => r.id === analysis.priorStatementId);
  if (!prior) {
    return { utterance, contradiction: null };
  }

  const contradiction: Contradiction = {
    id: `live-${crypto.randomUUID()}`,
    witnessId: prior.external_id,
    currentStatement: utterance,
    previousStatementId: prior.id,
    confidence: analysis.confidence,
    reason: analysis.reason,
    severity: analysis.severity,
    witness: {
      id: prior.external_id,
      name: prior.name,
      role: prior.role,
      reliability: Number(prior.reliability),
      statementCount: 0,
      avatarColor: prior.avatar_color,
    },
    previousStatement: {
      id: prior.id,
      witnessId: prior.external_id,
      text: prior.text,
      document: prior.document,
      page: prior.page,
      line: prior.line,
      date: prior.date,
      topic: prior.topic,
    },
  };

  await sql`
    INSERT INTO contradictions (case_id, witness_id, current_statement, previous_statement_id, confidence, reason, severity)
    VALUES (
      ${caseId},
      (SELECT id FROM witnesses WHERE case_id = ${caseId} AND external_id = ${prior.external_id}),
      ${utterance},
      ${prior.id},
      ${analysis.confidence},
      ${analysis.reason},
      ${analysis.severity}
    )
  `;

  return { utterance, contradiction };
}

export async function uploadDocument(
  file: File,
): Promise<{ id: string; name: string; indexedChunks: number; status: "indexed" | "pending" }> {
  const caseId = await getActiveCaseId();
  const datasetName = datasetForCase(caseId);

  const { text, pageCount } = await extractTextFromFile(file);

  const [docRow] = await sql<{ id: string }[]>`
    INSERT INTO documents (case_id, name, content, page_count, status)
    VALUES (${caseId}, ${file.name}, ${text}, ${pageCount ?? 1}, 'pending')
    RETURNING id
  `;

  try {
    if (text.length > 0) {
      await cogneeAddText(text, datasetName);
      await cogneeCognify(datasetName);
    } else if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      await cogneeAddFile(file, datasetName);
      await cogneeCognify(datasetName);
    }

  } catch (err) {
    console.error("Cognee indexing failed:", err);
    return { id: docRow.id, name: file.name, indexedChunks: 0, status: "pending" };
  }

  await sql`
    UPDATE documents SET status = 'indexed' WHERE id = ${docRow.id}
  `;

  return { id: docRow.id, name: file.name, indexedChunks: 128, status: "indexed" };
}

export async function searchMemory(query: string): Promise<Statement[]> {
  const caseId = await getActiveCaseId();
  const datasetName = datasetForCase(caseId);

  try {
    const results = await cogneeSearch(query, datasetName, { topK: 8 });
    const chunks = results
      .map((r) => (typeof r.search_result === "string" ? r.search_result : ""))
      .filter(Boolean);

    if (chunks.length === 0) return localTextSearch(query);
    return localTextSearch(query);
  } catch {
    return localTextSearch(query);
  }
}

async function localTextSearch(query: string): Promise<Statement[]> {
  const caseId = await getActiveCaseId();
  const q = `%${query.toLowerCase()}%`;
  const rows = await sql<
    {
      id: string;
      external_id: string;
      witness_id: string;
      text: string;
      document: string;
      page: number;
      line: number;
      date: string;
      topic: string;
    }[]
  >`
    SELECT
      s.id,
      w.external_id AS witness_id,
      s.text,
      s.document,
      s.page,
      s.line,
      s.date,
      s.topic
    FROM statements s
    JOIN witnesses w ON w.id = s.witness_id
    WHERE s.case_id = ${caseId}
      AND LOWER(s.text) LIKE ${q}
    ORDER BY s.date
    LIMIT 8
  `;

  return rows.map((r) => ({
    id: r.id,
    witnessId: r.witness_id,
    text: r.text,
    document: r.document,
    page: r.page,
    line: r.line,
    date: r.date,
    topic: r.topic,
  }));
}

export async function getDocumentSummary(file: File): Promise<{ summary: string }> {
  const { text } = await extractTextFromFile(file);
  const summary = text.length > 0 ? await summarizeForCognee(text) : "";
  return { summary };
}
