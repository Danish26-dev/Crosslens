-- CrossLens portable Postgres schema
-- Run this once against your DATABASE_URL to create tables.

CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE,
  caption TEXT NOT NULL,
  docket TEXT,
  court TEXT,
  judge TEXT,
  charge TEXT,
  status TEXT,
  next_hearing TEXT,
  attorney TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS witnesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  external_id TEXT,
  name TEXT NOT NULL,
  role TEXT,
  reliability NUMERIC(4,2),
  avatar_color TEXT,
  statement_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_id, external_id)
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT,
  page_count INTEGER,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_id, name)
);



CREATE TABLE IF NOT EXISTS statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  witness_id UUID REFERENCES witnesses(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  external_id TEXT,
  text TEXT NOT NULL,
  document TEXT,
  page INTEGER,
  line INTEGER,
  date TEXT,
  topic TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_id, external_id)
);


CREATE TABLE IF NOT EXISTS evidence_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  external_id TEXT,
  label TEXT NOT NULL,
  kind TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_id, external_id)
);

CREATE TABLE IF NOT EXISTS evidence_statement_links (
  evidence_id UUID REFERENCES evidence_items(id) ON DELETE CASCADE,
  statement_id UUID REFERENCES statements(id) ON DELETE CASCADE,
  PRIMARY KEY (evidence_id, statement_id)
);

CREATE TABLE IF NOT EXISTS evidence_witness_links (
  evidence_id UUID REFERENCES evidence_items(id) ON DELETE CASCADE,
  witness_id UUID REFERENCES witnesses(id) ON DELETE CASCADE,
  PRIMARY KEY (evidence_id, witness_id)
);

CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  external_id TEXT,
  date TEXT NOT NULL,
  label TEXT NOT NULL,
  kind TEXT,
  document TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_id, external_id)
);

CREATE TABLE IF NOT EXISTS contradictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  witness_id UUID REFERENCES witnesses(id) ON DELETE CASCADE,
  current_statement TEXT NOT NULL,
  previous_statement_id UUID REFERENCES statements(id) ON DELETE SET NULL,
  confidence NUMERIC(4,2),
  reason TEXT,
  severity TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
