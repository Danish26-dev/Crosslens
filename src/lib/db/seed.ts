// Seed data for the demo case: State v. Marshall
// This is the same data previously hardcoded in src/lib/mock/case.ts,
// now designed to be inserted into the real Postgres backend.

import { pg as sql } from "./pg";

export const SEED_CASE = {
  external_id: "case-2024-cr-01472",
  caption: "State v. Marshall",
  docket: "2024-CR-01472",
  court: "Superior Court, Dept. 7",
  judge: "Hon. R. Alvarez",
  charge: "Second-degree burglary; Grand theft",
  status: "In Trial",
  next_hearing: "Tomorrow, 09:30 AM",
  attorney: "M. Chen, Lead Counsel",
};

export const SEED_WITNESSES = [
  {
    external_id: "w-01",
    name: "Daniel Reyes",
    role: "Eyewitness (Neighbor)",
    reliability: 0.62,
    avatar_color: "#3b82f6",
    statement_count: 14,
  },
  {
    external_id: "w-02",
    name: "Ofc. Karen Whitaker",
    role: "Responding Officer",
    reliability: 0.88,
    avatar_color: "#10b981",
    statement_count: 22,
  },
  {
    external_id: "w-03",
    name: "Dr. Elena Park",
    role: "Forensic Expert",
    reliability: 0.94,
    avatar_color: "#8b5cf6",
    statement_count: 9,
  },
];

export const SEED_DOCUMENTS = [
  { name: "Police Interview — 03/14", page_count: 8, content: "" },
  { name: "Deposition — 06/02", page_count: 24, content: "" },
  { name: "Incident Report — 03/14", page_count: 4, content: "" },
  { name: "Preliminary Hearing — 05/09", page_count: 42, content: "" },
  { name: "Forensic Report — 04/21", page_count: 12, content: "" },
];

export const SEED_STATEMENTS = [
  {
    external_id: "s-01",
    witness_external_id: "w-01",
    document: "Police Interview — 03/14",
    page: 4,
    line: 22,
    date: "2024-03-14",
    text: "I saw a man in a dark blue jacket leave the house around 10:45 PM.",
    topic: "identification",
  },
  {
    external_id: "s-02",
    witness_external_id: "w-01",
    document: "Deposition — 06/02",
    page: 17,
    line: 8,
    date: "2024-06-02",
    text: "It was closer to 11:15 when I noticed someone in a black hoodie by the driveway.",
    topic: "identification",
  },
  {
    external_id: "s-03",
    witness_external_id: "w-02",
    document: "Incident Report — 03/14",
    page: 2,
    line: 11,
    date: "2024-03-14",
    text: "The rear window showed no signs of forced entry upon initial inspection.",
    topic: "scene",
  },
  {
    external_id: "s-04",
    witness_external_id: "w-02",
    document: "Preliminary Hearing — 05/09",
    page: 33,
    line: 4,
    date: "2024-05-09",
    text: "Pry marks were clearly visible on the rear window frame when we arrived.",
    topic: "scene",
  },
  {
    external_id: "s-05",
    witness_external_id: "w-03",
    document: "Forensic Report — 04/21",
    page: 6,
    line: 2,
    date: "2024-04-21",
    text: "Latent prints on the safe are consistent, to a reasonable degree of certainty, with the defendant.",
    topic: "forensic",
  },
  {
    external_id: "s-06",
    witness_external_id: "w-01",
    document: "Preliminary Hearing — 05/09",
    page: 12,
    line: 19,
    date: "2024-05-09",
    text: "I had two beers at dinner. I was completely sober when I looked out the window.",
    topic: "state",
  },
];


export const SEED_EVIDENCE = [
  {
    external_id: "e-01",
    label: "Exhibit A — Doorbell Footage",
    kind: "Recording",
    description: "Neighbor's Ring camera timestamp shows 11:07 PM.",
    linked_statement_texts: [
      "I saw a man in a dark blue jacket leave the house around 10:45 PM.",
      "It was closer to 11:15 when I noticed someone in a black hoodie by the driveway.",
    ],
    linked_witness_external_ids: ["w-01"],
  },
  {
    external_id: "e-02",
    label: "Exhibit B — Rear window photos",
    kind: "Photograph",
    description: "High-resolution scene photos showing tool marks.",
    linked_statement_texts: [
      "The rear window showed no signs of forced entry upon initial inspection.",
      "Pry marks were clearly visible on the rear window frame when we arrived.",
    ],
    linked_witness_external_ids: ["w-02"],
  },
  {
    external_id: "e-03",
    label: "Exhibit C — Latent print card",
    kind: "Physical",
    description: "10-point match, safe handle, right index finger.",
    linked_statement_texts: [
      "Latent prints on the safe are consistent, to a reasonable degree of certainty, with the defendant.",
    ],
    linked_witness_external_ids: ["w-03"],
  },
  {
    external_id: "e-04",
    label: "Exhibit D — Bar receipt",
    kind: "Document",
    description: "Card receipt showing 4 drinks between 8:14 and 10:22 PM.",
    linked_statement_texts: [
      "I had two beers at dinner. I was completely sober when I looked out the window.",
    ],
    linked_witness_external_ids: ["w-01"],
  },
];

export const SEED_TIMELINE = [
  { external_id: "t-01", date: "2024-03-14", label: "911 call & first response", kind: "interview", document: "CAD log" },
  { external_id: "t-02", date: "2024-03-14", label: "Neighbor interview — Reyes", kind: "interview", document: "Police Interview — 03/14" },
  { external_id: "t-03", date: "2024-04-21", label: "Forensic lab report filed", kind: "evidence", document: "Forensic Report — 04/21" },
  { external_id: "t-04", date: "2024-05-09", label: "Preliminary hearing", kind: "hearing", document: "Prelim Transcript — 05/09" },
  { external_id: "t-05", date: "2024-06-02", label: "Reyes deposition", kind: "deposition", document: "Deposition — 06/02" },
  { external_id: "t-06", date: "2024-07-01", label: "Trial — Day 1", kind: "trial" },
  { external_id: "t-07", date: "2024-07-04", label: "Trial — Day 4 (today)", kind: "trial" },
];

export const SEED_CONTRADICTIONS = [
  {
    witness_external_id: "w-01",
    current_statement: "The suspect wore a black hoodie and left around 11:15 PM.",
    previous_statement_text: "I saw a man in a dark blue jacket leave the house around 10:45 PM.",
    confidence: 0.92,
    reason: "Prior statement described a dark blue jacket at 10:45 PM. 30-minute discrepancy and clothing color/type mismatch.",
    severity: "high",
  },
  {
    witness_external_id: "w-02",
    current_statement: "Pry marks were clearly visible on the rear window when we arrived.",
    previous_statement_text: "The rear window showed no signs of forced entry upon initial inspection.",
    confidence: 0.88,
    reason: "Contradicts initial incident report noting no signs of forced entry on first inspection.",
    severity: "high",
  },
  {
    witness_external_id: "w-01",
    current_statement: "I had two beers with dinner and felt sharp the whole night.",
    previous_statement_text: "I had two beers at dinner. I was completely sober when I looked out the window.",
    confidence: 0.74,
    reason: "Exhibit D (bar receipt) shows four drinks charged to witness's card before returning home.",
    severity: "medium",
  },
];

export async function seedDatabase() {
  const [caseRow] = await sql`
    INSERT INTO cases ${sql(SEED_CASE)}
    ON CONFLICT (external_id) DO UPDATE SET
      caption = EXCLUDED.caption,
      docket = EXCLUDED.docket,
      court = EXCLUDED.court,
      judge = EXCLUDED.judge,
      charge = EXCLUDED.charge,
      status = EXCLUDED.status,
      next_hearing = EXCLUDED.next_hearing,
      attorney = EXCLUDED.attorney
    RETURNING id
  `;

  const caseId = caseRow.id as string;

  // Seed witnesses
  const witnessMap = new Map<string, string>();
  for (const w of SEED_WITNESSES) {
    const [row] = await sql`
      INSERT INTO witnesses ${sql({ ...w, case_id: caseId })}
      ON CONFLICT (case_id, external_id) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        reliability = EXCLUDED.reliability,
        avatar_color = EXCLUDED.avatar_color,
        statement_count = EXCLUDED.statement_count
      RETURNING id, external_id
    `;
    witnessMap.set(row.external_id as string, row.id as string);
  }

  // Seed documents
  const documentMap = new Map<string, string>();
  for (const d of SEED_DOCUMENTS) {
    await sql`
      INSERT INTO documents (case_id, name, content, page_count, status)
      VALUES (${caseId}, ${d.name}, ${d.content}, ${d.page_count}, 'indexed')
      ON CONFLICT (case_id, name) DO NOTHING
    `;
  }

  const documentRows = await sql<{ id: string; name: string }[]>`
    SELECT id, name FROM documents WHERE case_id = ${caseId}
  `;
  for (const row of documentRows) {
    documentMap.set(row.name, row.id);
  }


  // Seed statements
  const statementMap = new Map<string, string>();
  for (const s of SEED_STATEMENTS) {
    const witnessId = witnessMap.get(s.witness_external_id);
    if (!witnessId) continue;
    const documentId = documentMap.get(s.document) ?? null;
    await sql`
      INSERT INTO statements ${sql({
        case_id: caseId,
        witness_id: witnessId,
        document_id: documentId,
        external_id: s.external_id,
        text: s.text,
        document: s.document,
        page: s.page,
        line: s.line,
        date: s.date,
        topic: s.topic,
      })}
      ON CONFLICT (case_id, external_id) DO UPDATE SET
        witness_id = EXCLUDED.witness_id,
        document_id = EXCLUDED.document_id,
        text = EXCLUDED.text,
        document = EXCLUDED.document,
        page = EXCLUDED.page,
        line = EXCLUDED.line,
        date = EXCLUDED.date,
        topic = EXCLUDED.topic
    `;
  }

  // Rebuild statement map from the database (handles first run and re-runs).
  const statementRows = await sql<{ id: string; text: string }[]>`
    SELECT id, text FROM statements WHERE case_id = ${caseId}
  `;
  for (const row of statementRows) {
    statementMap.set(row.text, row.id);
  }



  // Seed evidence
  for (const e of SEED_EVIDENCE) {
    const [row] = await sql`
      INSERT INTO evidence_items ${sql({
        case_id: caseId,
        external_id: e.external_id,
        label: e.label,
        kind: e.kind,
        description: e.description,
      })}
      ON CONFLICT (case_id, external_id) DO UPDATE SET
        label = EXCLUDED.label,
        kind = EXCLUDED.kind,
        description = EXCLUDED.description
      RETURNING id
    `;
    const evidenceId = row.id as string;

    for (const text of e.linked_statement_texts) {
      const statementId = statementMap.get(text);
      if (statementId) {
        await sql`
          INSERT INTO evidence_statement_links (evidence_id, statement_id)
          VALUES (${evidenceId}, ${statementId})
          ON CONFLICT DO NOTHING
        `;
      }
    }

    for (const wid of e.linked_witness_external_ids) {
      const witnessId = witnessMap.get(wid);
      if (witnessId) {
        await sql`
          INSERT INTO evidence_witness_links (evidence_id, witness_id)
          VALUES (${evidenceId}, ${witnessId})
          ON CONFLICT DO NOTHING
        `;
      }
    }
  }

  // Seed timeline
  for (const t of SEED_TIMELINE) {
    await sql`
      INSERT INTO timeline_events ${sql({
        case_id: caseId,
        external_id: t.external_id,
        date: t.date,
        label: t.label,
        kind: t.kind,
        document: t.document ?? null,
      })}
      ON CONFLICT (case_id, external_id) DO UPDATE SET
        date = EXCLUDED.date,
        label = EXCLUDED.label,
        kind = EXCLUDED.kind,
        document = EXCLUDED.document
    `;
  }


  // Seed contradictions
  for (const c of SEED_CONTRADICTIONS) {
    const witnessId = witnessMap.get(c.witness_external_id);
    if (!witnessId) continue;
    const previousStatementId = statementMap.get(c.previous_statement_text) ?? null;
    await sql`
      INSERT INTO contradictions ${sql({
        case_id: caseId,
        witness_id: witnessId,
        current_statement: c.current_statement,
        previous_statement_id: previousStatementId,
        confidence: c.confidence,
        reason: c.reason,
        severity: c.severity,
      })}
      ON CONFLICT DO NOTHING
    `;
  }

  return caseId;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then((id) => {
      console.log("Seeded case:", id);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seed failed:", err);
      process.exit(1);
    });
}
