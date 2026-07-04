// Real CrossLens API layer.
// Every function here is a TanStack server function (RPC). Import them freely
// from UI code; the build replaces the bodies with RPC stubs on the client.

import { createServerFn } from "@tanstack/react-start";
import {
  getCases,
  getCaseInfo,
  getWitnesses,
  getStatements,
  getEvidence,
  getTimeline,
  getContradictions,
  submitTestimony as submitTestimonyServer,
  uploadDocument as uploadDocumentServer,
  searchMemory as searchMemoryServer,
  getDocumentSummary as getDocumentSummaryServer,
  ensureSeeded,
  createCase as createCaseServer,
  rememberFact,
  recallFromMemory,
  improveMemory,
  forgetMemory,
} from "./case.server";
import { seedDatabase } from "@/lib/db/seed";
import type {
  CaseInfo,
  Contradiction,
  Evidence,
  Statement,
  TimelineEvent,
  Witness,
} from "@/lib/types/case";


export const getCasesFn = createServerFn({ method: "GET" }).handler(async () => getCases());

export const getCaseInfoFn = createServerFn({ method: "GET" }).handler(async () => getCaseInfo());

export const getWitnessesFn = createServerFn({ method: "GET" }).handler(async () => getWitnesses());

export const getStatementsFn = createServerFn({ method: "GET" }).handler(async () => getStatements());

export const getEvidenceFn = createServerFn({ method: "GET" }).handler(async () => getEvidence());

export const getTimelineFn = createServerFn({ method: "GET" }).handler(async () => getTimeline());

export const getContradictionsFn = createServerFn({ method: "GET" }).handler(async () => getContradictions());

export const submitTestimony = createServerFn({ method: "POST" })
  .inputValidator((data: { utterance: string }) => {
    if (!data.utterance || typeof data.utterance !== "string") {
      throw new Error("utterance must be a non-empty string");
    }
    return data;
  })
  .handler(async ({ data }) => submitTestimonyServer(data.utterance));

export const uploadDocument = createServerFn({ method: "POST" })
  .inputValidator((data: FormData) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    return data;
  })
  .handler(async ({ data }) => {
    const file = data.get("file") as File | null;
    if (!file) throw new Error("No file provided");
    return uploadDocumentServer(file);
  });

export const searchMemory = createServerFn({ method: "POST" })
  .inputValidator((data: { query: string }) => {
    if (!data.query || typeof data.query !== "string") throw new Error("query is required");
    return data;
  })
  .handler(async ({ data }) => searchMemoryServer(data.query));

export const getDocumentSummary = createServerFn({ method: "POST" })
  .inputValidator((data: FormData) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    return data;
  })
  .handler(async ({ data }) => {
    const file = data.get("file") as File | null;
    if (!file) throw new Error("No file provided");
    return getDocumentSummaryServer(file);
  });

export const seedDatabaseFn = createServerFn({ method: "POST" }).handler(async () => {
  const caseId = await seedDatabase();
  return { caseId };
});

export const createCaseFn = createServerFn({ method: "POST" })
  .inputValidator((data: {
    caption: string;
    docket?: string;
    court?: string;
    judge?: string;
    charge?: string;
    status?: string;
    nextHearing?: string;
    attorney?: string;
  }) => {
    if (!data?.caption || typeof data.caption !== "string") {
      throw new Error("caption is required");
    }
    return data;
  })
  .handler(async ({ data }) => createCaseServer(data));


export const ensureSeededFn = createServerFn({ method: "POST" }).handler(async () => ensureSeeded());

// ---------- Cognee hackathon primitives ----------

export const cogneeRememberFn = createServerFn({ method: "POST" })
  .inputValidator((data: { text: string }) => {
    if (!data?.text || typeof data.text !== "string") throw new Error("text required");
    return data;
  })
  .handler(async ({ data }) => rememberFact(data.text));

export const cogneeRecallFn = createServerFn({ method: "POST" })
  .inputValidator((data: { query: string }) => {
    if (!data?.query || typeof data.query !== "string") throw new Error("query required");
    return data;
  })
  .handler(async ({ data }) => recallFromMemory(data.query));

export const cogneeImproveFn = createServerFn({ method: "POST" }).handler(async () => improveMemory());

export const cogneeForgetFn = createServerFn({ method: "POST" })
  .inputValidator((data: { dataset?: string }) => data ?? {})
  .handler(async ({ data }) => forgetMemory(data?.dataset));


// ---------- Demo journey (Cognee-backed, judge-friendly) ----------

export const listDatasetDocsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { listDatasetDocs } = await import("@/lib/cognee/demo.server");
  return listDatasetDocs();
});

export const askCrossLensFn = createServerFn({ method: "POST" })
  .inputValidator((data: { query: string }) => {
    if (!data?.query || typeof data.query !== "string") throw new Error("query required");
    return data;
  })
  .handler(async ({ data }) => {
    const { askCrossLens } = await import("@/lib/cognee/demo.server");
    return askCrossLens(data.query);
  });

export const getGraphFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getGraph } = await import("@/lib/cognee/demo.server");
  return getGraph();
});

// Re-export types for UI convenience.
export type { CaseInfo, Contradiction, Evidence, Statement, TimelineEvent, Witness };
