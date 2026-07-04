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
  previousStatement?: Statement;
  witness?: Witness;
};


export type TimelineEvent = {
  id: string;
  date: string;
  label: string;
  kind: "interview" | "deposition" | "hearing" | "trial" | "evidence";
  document?: string;
};

export type CaseInfo = {
  id: string;
  caption: string;
  docket: string;
  court: string;
  judge: string;
  charge: string;
  status: string;
  nextHearing: string;
  attorney: string;
};
