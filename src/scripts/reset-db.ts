import { pg as sql } from "../lib/db/pg";

async function resetDb() {
  await sql`DROP TABLE IF EXISTS evidence_statement_links, evidence_witness_links, timeline_events, contradictions, statements, evidence_items, documents, witnesses, cases CASCADE`;
  console.log("Database reset complete");
  await sql.end();
}

resetDb().catch((err) => {
  console.error("Reset failed:", err);
  process.exit(1);
});
