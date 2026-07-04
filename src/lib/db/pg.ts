// Node/script-only Postgres client using postgres.js. Not for the Workers runtime.
// Use this from seed scripts and CLI tools where transactions and the
// `sql(object)` helper are convenient. The request-safe HTTP client lives in
// ./index.ts and is what server functions must use.

import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL environment variable is not set");

export const pg = postgres(DATABASE_URL, {
  max: 4,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: DATABASE_URL.includes("sslmode=require") ? "require" : "prefer",
});
