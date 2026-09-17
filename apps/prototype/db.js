// Minimal persistence layer for the Phase 7 milestone prototype.
//
// Uses Node's built-in node:sqlite (experimental) so the prototype has zero
// npm dependencies and is guaranteed runnable with `node --version` >= 22.5.
// This is a prototype-grade choice, not an architecture recommendation for
// the eventual real system (see PROJECT_CONSTITUTION.md / docs/episode-model.md
// for the theory this schema is a deliberately simplified embodiment of).

import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "data.sqlite");

export const db = new DatabaseSync(DB_PATH);

// Episode Ledger: events are append-only (see AGENTS.md Principle 1).
// Nothing in this file ever executes UPDATE or DELETE against `events`.
const SCHEMA = `
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  actor TEXT NOT NULL,           -- 'user' | 'ai' | 'tool' | 'system'
  type TEXT NOT NULL,            -- 'message' | 'commitment' | 'non_fulfillment' | 'acknowledgment' | ...
  modality TEXT NOT NULL DEFAULT 'text',
  payload TEXT NOT NULL,         -- free text / JSON content
  episode_id INTEGER,
  corrects_event_id INTEGER,
  conflicts_with_event_id INTEGER
);

CREATE TABLE IF NOT EXISTS episodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  topic TEXT NOT NULL,
  summary TEXT NOT NULL,
  linked_episode_id INTEGER
);

-- Subjective Memory (docs/memory-model.md variables, simplified: fidelity,
-- accessibility, confidence stand in for the fuller Fidelity/Accessibility/
-- Influence/Confidence/Provenance set; this is a deliberate prototype-scope
-- reduction, not a theory decision).
CREATE TABLE IF NOT EXISTS memories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  episode_id INTEGER NOT NULL,
  ts TEXT NOT NULL,
  fidelity REAL NOT NULL,
  accessibility REAL NOT NULL,
  confidence REAL NOT NULL,
  dormant INTEGER NOT NULL DEFAULT 0,
  content TEXT NOT NULL
);

-- Interpretation layer: a reading of one or more memories, always attached
-- to a belief key, always carrying explicit provenance (memory ids).
CREATE TABLE IF NOT EXISTS interpretations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  belief_key TEXT NOT NULL,
  statement TEXT NOT NULL,
  confidence REAL NOT NULL,
  memory_ids TEXT NOT NULL,      -- JSON array of memory ids
  status TEXT NOT NULL DEFAULT 'weak'  -- 'weak' | 'applied'
);

-- Current Self Model state: one row per belief key.
CREATE TABLE IF NOT EXISTS beliefs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  statement TEXT NOT NULL,
  strength REAL NOT NULL,        -- 0..1
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS behavioral_tendencies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Every important state change (belief update, behavior update, self-model
-- version bump) is recorded here with full provenance, per
-- PROJECT_CONSTITUTION.md Section 2/4 (causal chain must be real and
-- inspectable) and AGENTS.md Principle 12.
CREATE TABLE IF NOT EXISTS change_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  type TEXT NOT NULL,            -- 'belief_update' | 'behavior_update' | 'self_model_version'
  subject_key TEXT NOT NULL,
  description TEXT NOT NULL,
  before_json TEXT NOT NULL,
  after_json TEXT NOT NULL,
  provenance_json TEXT NOT NULL, -- JSON: { interpretationIds, memoryIds, episodeIds, causeChangeEventId? }
  path TEXT NOT NULL             -- 'single_event' | 'accumulated' | 'derived'
);

CREATE TABLE IF NOT EXISTS self_model_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  change_event_id INTEGER NOT NULL,
  snapshot_json TEXT NOT NULL
);
`;

db.exec(SCHEMA);

export function resetDb() {
  db.exec(`
    DELETE FROM self_model_versions;
    DELETE FROM change_events;
    DELETE FROM behavioral_tendencies;
    DELETE FROM beliefs;
    DELETE FROM interpretations;
    DELETE FROM memories;
    DELETE FROM episodes;
    DELETE FROM events;
    DELETE FROM sqlite_sequence;
  `);
}
