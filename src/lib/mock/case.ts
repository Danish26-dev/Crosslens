// Mock case data — State v. Marshall
// Structured so a future Cognee/vector-DB integration can replace this module.

export type Witness = {
  id: string;
  name: string;
  role: string;
  reliability: number; // 0-1
  statementCount: number;
  avatarColor: string;
};

export type Statement = {
  id: string;
  witnessId: string;
  document: string;
  page: number;
  line: number;
  date: string;
  text: string;
  topic: string;
};

export type Evidence = {
  id: string;
  label: string;
  kind: "Photograph" | "Document" | "Physical" | "Digital" | "Recording";
  description: string;
  linkedStatementIds: string[];
  linkedWitnessIds: string[];
};

export type Contradiction = {
  id: string;
  witnessId: string;
  currentStatement: string;
  previousStatementId: string;
  confidence: number;
  reason: string;
  severity: "high" | "medium" | "low";
};

export type TimelineEvent = {
  id: string;
  date: string;
  label: string;
  kind: "interview" | "deposition" | "hearing" | "trial" | "evidence";
  document?: string;
};

export const caseInfo = {
  id: "case-2024-cr-01472",
  caption: "State v. Marshall",
  docket: "2024-CR-01472",
  court: "Superior Court, Dept. 7",
  judge: "Hon. R. Alvarez",
  charge: "Second-degree burglary; Grand theft",
  status: "In Trial",
  nextHearing: "Tomorrow, 09:30 AM",
  attorney: "M. Chen, Lead Counsel",
};

export const witnesses: Witness[] = [
  {
    id: "w-01",
    name: "Daniel Reyes",
    role: "Eyewitness (Neighbor)",
    reliability: 0.62,
    statementCount: 14,
    avatarColor: "#3b82f6",
  },
  {
    id: "w-02",
    name: "Ofc. Karen Whitaker",
    role: "Responding Officer",
    reliability: 0.88,
    statementCount: 22,
    avatarColor: "#10b981",
  },
  {
    id: "w-03",
    name: "Dr. Elena Park",
    role: "Forensic Expert",
    reliability: 0.94,
    statementCount: 9,
    avatarColor: "#8b5cf6",
  },
];

export const statements: Statement[] = [
  {
    id: "s-01",
    witnessId: "w-01",
    document: "Police Interview — 03/14",
    page: 4,
    line: 22,
    date: "2024-03-14",
    text: "I saw a man in a dark blue jacket leave the house around 10:45 PM.",
    topic: "identification",
  },
  {
    id: "s-02",
    witnessId: "w-01",
    document: "Deposition — 06/02",
    page: 17,
    line: 8,
    date: "2024-06-02",
    text: "It was closer to 11:15 when I noticed someone in a black hoodie by the driveway.",
    topic: "identification",
  },
  {
    id: "s-03",
    witnessId: "w-02",
    document: "Incident Report — 03/14",
    page: 2,
    line: 11,
    date: "2024-03-14",
    text: "The rear window showed no signs of forced entry upon initial inspection.",
    topic: "scene",
  },
  {
    id: "s-04",
    witnessId: "w-02",
    document: "Preliminary Hearing — 05/09",
    page: 33,
    line: 4,
    date: "2024-05-09",
    text: "Pry marks were clearly visible on the rear window frame when we arrived.",
    topic: "scene",
  },
  {
    id: "s-05",
    witnessId: "w-03",
    document: "Forensic Report — 04/21",
    page: 6,
    line: 2,
    date: "2024-04-21",
    text: "Latent prints on the safe are consistent, to a reasonable degree of certainty, with the defendant.",
    topic: "forensic",
  },
  {
    id: "s-06",
    witnessId: "w-01",
    document: "Preliminary Hearing — 05/09",
    page: 12,
    line: 19,
    date: "2024-05-09",
    text: "I had two beers at dinner. I was completely sober when I looked out the window.",
    topic: "state",
  },
];

export const evidence: Evidence[] = [
  {
    id: "e-01",
    label: "Exhibit A — Doorbell Footage",
    kind: "Recording",
    description: "Neighbor's Ring camera timestamp shows 11:07 PM.",
    linkedStatementIds: ["s-01", "s-02"],
    linkedWitnessIds: ["w-01"],
  },
  {
    id: "e-02",
    label: "Exhibit B — Rear window photos",
    kind: "Photograph",
    description: "High-resolution scene photos showing tool marks.",
    linkedStatementIds: ["s-03", "s-04"],
    linkedWitnessIds: ["w-02"],
  },
  {
    id: "e-03",
    label: "Exhibit C — Latent print card",
    kind: "Physical",
    description: "10-point match, safe handle, right index finger.",
    linkedStatementIds: ["s-05"],
    linkedWitnessIds: ["w-03"],
  },
  {
    id: "e-04",
    label: "Exhibit D — Bar receipt",
    kind: "Document",
    description: "Card receipt showing 4 drinks between 8:14 and 10:22 PM.",
    linkedStatementIds: ["s-06"],
    linkedWitnessIds: ["w-01"],
  },
];

export const contradictions: Contradiction[] = [
  {
    id: "c-01",
    witnessId: "w-01",
    currentStatement:
      "The suspect wore a black hoodie and left around 11:15 PM.",
    previousStatementId: "s-01",
    confidence: 0.92,
    reason:
      "Prior statement described a dark blue jacket at 10:45 PM. 30-minute discrepancy and clothing color/type mismatch.",
    severity: "high",
  },
  {
    id: "c-02",
    witnessId: "w-02",
    currentStatement:
      "Pry marks were clearly visible on the rear window when we arrived.",
    previousStatementId: "s-03",
    confidence: 0.88,
    reason:
      "Contradicts initial incident report noting no signs of forced entry on first inspection.",
    severity: "high",
  },
  {
    id: "c-03",
    witnessId: "w-01",
    currentStatement: "I had two beers with dinner and felt sharp the whole night.",
    previousStatementId: "s-06",
    confidence: 0.74,
    reason:
      "Exhibit D (bar receipt) shows four drinks charged to witness's card before returning home.",
    severity: "medium",
  },
];

export const timeline: TimelineEvent[] = [
  { id: "t-01", date: "2024-03-14", label: "911 call & first response", kind: "interview", document: "CAD log" },
  { id: "t-02", date: "2024-03-14", label: "Neighbor interview — Reyes", kind: "interview", document: "Police Interview — 03/14" },
  { id: "t-03", date: "2024-04-21", label: "Forensic lab report filed", kind: "evidence", document: "Forensic Report — 04/21" },
  { id: "t-04", date: "2024-05-09", label: "Preliminary hearing", kind: "hearing", document: "Prelim Transcript — 05/09" },
  { id: "t-05", date: "2024-06-02", label: "Reyes deposition", kind: "deposition", document: "Deposition — 06/02" },
  { id: "t-06", date: "2024-07-01", label: "Trial — Day 1", kind: "trial" },
  { id: "t-07", date: "2024-07-04", label: "Trial — Day 4 (today)", kind: "trial" },
];

export function findWitness(id: string) {
  return witnesses.find((w) => w.id === id);
}

export function findStatement(id: string) {
  return statements.find((s) => s.id === id);
}

// Very small keyword-based "contradiction engine" — deterministic mock.
export function analyzeUtterance(utterance: string): Contradiction | null {
  const u = utterance.toLowerCase();
  if ((u.includes("black") || u.includes("hoodie") || /11:\d\d/.test(u)) && u.includes("pm")) {
    return contradictions[0];
  }
  if (u.includes("pry") || u.includes("forced entry") || u.includes("rear window")) {
    return contradictions[1];
  }
  if (u.includes("beer") || u.includes("sober") || u.includes("drinks")) {
    return contradictions[2];
  }
  return null;
}
