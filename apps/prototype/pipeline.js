// Core pipeline: Event -> Episode -> Memory -> Interpretation -> Belief/
// Behavior change -> Self Model version, plus the reverse traversal used to
// answer "why are you different now?"
//
// This is a deliberately simplified, deterministic, rule-based
// implementation of the theory in PROJECT_CONSTITUTION.md and
// docs/episode-model.md. It exists to prove the milestone described in the
// project brief (Section 二十三): a real, inspectable causal chain from a
// belief change back to the specific episodes that caused it. It is NOT a
// claim about what the production interpretation engine should look like
// (that's Phase 2-5 work) -- in particular, a real system would likely use
// an LLM for episode segmentation, salience judgment, and interpretation
// generation, where this prototype uses fixed heuristics and hand-authored
// interpretation text so the demo is fully deterministic and dependency-free.

import { db } from "./db.js";

// --- Thresholds -------------------------------------------------------
// These operationalize PROJECT_CONSTITUTION.md Section 6's two-path
// structure for legitimate change. The specific numbers are prototype
// placeholders (explicitly left undefined in theory -- see Section 6's
// "Consequence" paragraph); they exist so the pipeline can make a decision,
// not as a validated model of real evidence sufficiency.
const SINGLE_EVENT_CONFIDENCE_THRESHOLD = 0.8; // Section 6: high bar for one event alone
const ACCUMULATED_MIN_COUNT = 2; // Section 6: repeated, directionally-consistent episodes
const ACCUMULATED_MIN_TOTAL_CONFIDENCE = 0.9;

function nowIso(offsetDays = 0) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString();
}

// --- Layer 1: Episode Ledger -------------------------------------------

export function recordEvent({ ts, actor, type, payload, modality = "text" }) {
  const stmt = db.prepare(
    `INSERT INTO events (ts, actor, type, modality, payload) VALUES (?, ?, ?, ?, ?)`
  );
  const info = stmt.run(ts, actor, type, modality, payload);
  return Number(info.lastInsertRowid);
}

export function formEpisode({ ts, topic, summary, eventIds, linkedEpisodeId = null }) {
  const stmt = db.prepare(
    `INSERT INTO episodes (ts, topic, summary, linked_episode_id) VALUES (?, ?, ?, ?)`
  );
  const info = stmt.run(ts, topic, summary, linkedEpisodeId);
  const episodeId = Number(info.lastInsertRowid);
  const update = db.prepare(`UPDATE events SET episode_id = ? WHERE id = ?`);
  for (const eventId of eventIds) update.run(episodeId, eventId);
  return episodeId;
}

// --- Layer 2: Subjective Memory -----------------------------------------

export function formMemory({ episodeId, ts, fidelity, confidence, content }) {
  const stmt = db.prepare(
    `INSERT INTO memories (episode_id, ts, fidelity, accessibility, confidence, dormant, content)
     VALUES (?, ?, ?, 1.0, ?, 0, ?)`
  );
  const info = stmt.run(episodeId, ts, fidelity, confidence, content);
  return Number(info.lastInsertRowid);
}

// --- Layer 3: Interpretation ---------------------------------------------

export function interpret({ ts, beliefKey, statement, confidence, memoryIds, status = "weak" }) {
  const stmt = db.prepare(
    `INSERT INTO interpretations (ts, belief_key, statement, confidence, memory_ids, status)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const info = stmt.run(ts, beliefKey, statement, confidence, JSON.stringify(memoryIds), status);
  return Number(info.lastInsertRowid);
}

function getBelief(key) {
  return db.prepare(`SELECT * FROM beliefs WHERE key = ?`).get(key);
}

export function seedBelief({ key, statement, strength, ts }) {
  db.prepare(
    `INSERT INTO beliefs (key, statement, strength, updated_at) VALUES (?, ?, ?, ?)`
  ).run(key, statement, strength, ts);
}

function bumpSelfModelVersion({ ts, changeEventId }) {
  const beliefs = db.prepare(`SELECT key, statement, strength FROM beliefs`).all();
  const tendencies = db.prepare(`SELECT key, value FROM behavioral_tendencies`).all();
  const prevVersion = db
    .prepare(`SELECT MAX(version_number) AS v FROM self_model_versions`)
    .get();
  const nextVersion = (prevVersion?.v ?? 0) + 1;
  db.prepare(
    `INSERT INTO self_model_versions (ts, version_number, change_event_id, snapshot_json)
     VALUES (?, ?, ?, ?)`
  ).run(ts, nextVersion, changeEventId, JSON.stringify({ beliefs, tendencies }));
  return nextVersion;
}

function episodeIdsForMemoryIds(memoryIds) {
  if (memoryIds.length === 0) return [];
  const placeholders = memoryIds.map(() => "?").join(",");
  const rows = db
    .prepare(`SELECT DISTINCT episode_id FROM memories WHERE id IN (${placeholders})`)
    .all(...memoryIds);
  return rows.map((r) => r.episode_id);
}

// Applies PROJECT_CONSTITUTION.md Section 6 (two legitimate-change paths)
// and Section 8 (weak/provisional beliefs must not drive behavior) to a
// freshly-created interpretation. Returns whether a belief update occurred.
export function evaluateBeliefUpdate({ beliefKey, ts }) {
  const belief = getBelief(beliefKey);
  if (!belief) throw new Error(`No belief seeded for key "${beliefKey}"`);

  const pending = db
    .prepare(
      `SELECT * FROM interpretations WHERE belief_key = ? AND status = 'weak' ORDER BY ts ASC`
    )
    .all(beliefKey);

  const strongest = pending.reduce(
    (max, i) => (i.confidence > max ? i.confidence : max),
    0
  );
  const totalConfidence = pending.reduce((sum, i) => sum + i.confidence, 0);

  const singleEventQualifies = strongest >= SINGLE_EVENT_CONFIDENCE_THRESHOLD;
  const accumulationQualifies =
    pending.length >= ACCUMULATED_MIN_COUNT &&
    totalConfidence >= ACCUMULATED_MIN_TOTAL_CONFIDENCE;

  if (!singleEventQualifies && !accumulationQualifies) {
    // Section 8: evidence insufficient -- interpretation(s) stay weak/
    // provisional and do NOT drive any behavior or belief change.
    return { updated: false, reason: "insufficient_evidence", pendingCount: pending.length };
  }

  const path = singleEventQualifies ? "single_event" : "accumulated";
  const memoryIds = [...new Set(pending.flatMap((i) => JSON.parse(i.memory_ids)))];
  const interpretationIds = pending.map((i) => i.id);
  const episodeIds = episodeIdsForMemoryIds(memoryIds);

  const before = { strength: belief.strength, statement: belief.statement };
  // Simplified magnitude rule: accumulated evidence shifts strength further
  // than a single (still-strict) event, reflecting more corroboration.
  const delta = path === "single_event" ? 0.3 : 0.4;
  const newStrength = Math.max(0, Math.round((belief.strength - delta) * 100) / 100);
  const after = { strength: newStrength, statement: belief.statement };

  db.prepare(`UPDATE beliefs SET strength = ?, updated_at = ? WHERE key = ?`).run(
    newStrength,
    ts,
    beliefKey
  );
  db.prepare(`UPDATE interpretations SET status = 'applied' WHERE id IN (${interpretationIds.map(() => "?").join(",")})`).run(
    ...interpretationIds
  );

  const changeEventId = Number(
    db
      .prepare(
        `INSERT INTO change_events (ts, type, subject_key, description, before_json, after_json, provenance_json, path)
         VALUES (?, 'belief_update', ?, ?, ?, ?, ?, ?)`
      )
      .run(
        ts,
        beliefKey,
        `Belief "${beliefKey}" weakened from ${before.strength} to ${after.strength}`,
        JSON.stringify(before),
        JSON.stringify(after),
        JSON.stringify({ interpretationIds, memoryIds, episodeIds }),
        path
      ).lastInsertRowid
  );

  bumpSelfModelVersion({ ts, changeEventId });

  return { updated: true, path, newStrength, changeEventId, episodeIds };
}

// --- Behavior layer --------------------------------------------------

export function updateBehavior({ ts, key, value, causeChangeEventId, description }) {
  const existing = db.prepare(`SELECT * FROM behavioral_tendencies WHERE key = ?`).get(key);
  const before = existing ? { value: existing.value } : { value: null };
  const after = { value };

  if (existing) {
    db.prepare(`UPDATE behavioral_tendencies SET value = ?, updated_at = ? WHERE key = ?`).run(
      value,
      ts,
      key
    );
  } else {
    db.prepare(
      `INSERT INTO behavioral_tendencies (key, value, updated_at) VALUES (?, ?, ?)`
    ).run(key, value, ts);
  }

  const changeEventId = Number(
    db
      .prepare(
        `INSERT INTO change_events (ts, type, subject_key, description, before_json, after_json, provenance_json, path)
         VALUES (?, 'behavior_update', ?, ?, ?, ?, ?, 'derived')`
      )
      .run(
        ts,
        key,
        description,
        JSON.stringify(before),
        JSON.stringify(after),
        JSON.stringify({ causeChangeEventId })
      ).lastInsertRowid
  );

  bumpSelfModelVersion({ ts, changeEventId });
  return changeEventId;
}

// --- Explanation (reverse traversal) -------------------------------------

function fmtDate(ts) {
  return ts.slice(0, 10);
}

export function explainChangeEvent(changeEventId) {
  const ce = db.prepare(`SELECT * FROM change_events WHERE id = ?`).get(changeEventId);
  if (!ce) return null;
  const provenance = JSON.parse(ce.provenance_json);
  const lines = [];

  let episodeIds = provenance.episodeIds ?? [];
  let rootDescription = ce.description;

  // Follow a "derived" (behavior <- belief) chain back to its root cause.
  if (provenance.causeChangeEventId) {
    const causeExplain = explainChangeEvent(provenance.causeChangeEventId);
    if (causeExplain) {
      episodeIds = causeExplain.episodeIds;
      lines.push(...causeExplain.lines);
      lines.push(`→ 这直接导致了：${ce.description}`);
      return { lines, episodeIds, description: rootDescription };
    }
  }

  const before = JSON.parse(ce.before_json);
  const after = JSON.parse(ce.after_json);
  lines.push(
    `${fmtDate(ce.ts)}：${ce.description}（${ce.path === "single_event" ? "由单次高显著性事件触发" : "由多次方向一致的经历累积触发"}）`
  );

  const episodes = episodeIds.map((id) =>
    db.prepare(`SELECT * FROM episodes WHERE id = ?`).get(id)
  );
  for (const ep of episodes) {
    const events = db
      .prepare(`SELECT * FROM events WHERE episode_id = ? ORDER BY ts ASC`)
      .all(ep.id);
    lines.push(`  - ${fmtDate(ep.ts)}（Episode #${ep.id}: ${ep.topic}）：${ep.summary}`);
    for (const ev of events) {
      lines.push(`      · [${ev.actor}] ${ev.payload}`);
    }
  }

  return { lines, episodeIds, description: rootDescription, before, after };
}

export function explainBeliefOrBehavior(key) {
  const row = db
    .prepare(
      `SELECT * FROM change_events WHERE subject_key = ? ORDER BY ts DESC LIMIT 1`
    )
    .get(key);
  if (!row) return { found: false };
  const result = explainChangeEvent(row.id);
  return { found: true, ...result };
}
