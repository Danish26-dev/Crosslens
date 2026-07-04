import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Neon's HTTP driver is stateless: each query is a fetch(). Safe for
// Cloudflare Workers, which forbid sharing I/O objects across requests.
// We expose a tagged-template `sql` compatible with the previous postgres.js
// call sites: `await sql<Row[]>\`SELECT ...\``.
const neonSql: NeonQueryFunction<false, false> = neon(DATABASE_URL);

type SqlTag = <T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<T>;

export const sql: SqlTag = ((strings: TemplateStringsArray, ...values: unknown[]) =>
  neonSql(strings, ...values)) as SqlTag;

export async function closeDb() {
  // HTTP driver — nothing to close.
}
