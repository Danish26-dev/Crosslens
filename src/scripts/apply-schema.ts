import { pg as sql } from "../lib/db/pg";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const schema = readFileSync(join(__dirname, "..", "lib", "db", "schema.sql"), "utf-8");

async function applySchema() {
  await sql.unsafe(schema);
  console.log("Schema applied successfully");
  await sql.end();
}

applySchema().catch((err) => {
  console.error("Schema application failed:", err);
  process.exit(1);
});
