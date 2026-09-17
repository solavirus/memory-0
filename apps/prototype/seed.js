// Seeds the milestone scenario described in the project brief (Section
// 二十三): Day 1 belief -> conflicting episodes -> interpretation change ->
// belief weakens -> behavior changes -> by "Day 14" the system can explain
// why, citing the real episodes. Every step below calls the real pipeline
// functions (nothing here fakes the end state) so /api/explain is doing
// genuine traversal over rows this script created, not returning
// pre-written text.

import { resetDb } from "./db.js";
import {
  recordEvent,
  formEpisode,
  formMemory,
  interpret,
  evaluateBeliefUpdate,
  seedBelief,
  updateBehavior,
} from "./pipeline.js";

resetDb();

function iso(daysFromEpoch) {
  const base = new Date("2026-01-01T09:00:00.000Z");
  base.setUTCDate(base.getUTCDate() + daysFromEpoch);
  return base.toISOString();
}

// --- Day 1: genesis episode establishing the baseline belief ------------

const genesisEvent1 = recordEvent({
  ts: iso(1),
  actor: "user",
  type: "message",
  payload: "放心吧，我说到做到的，之前答应你的事我都做了。",
});
const genesisEvent2 = recordEvent({
  ts: iso(1),
  actor: "ai",
  type: "message",
  payload: "好，那我就不多提醒你了，相信你。",
});
const genesisEpisode = formEpisode({
  ts: iso(1),
  topic: "建立信任基线",
  summary: "用户主动强调自己说到做到，AI表示会给予信任、不做过度提醒。",
  eventIds: [genesisEvent1, genesisEvent2],
});
const genesisMemory = formMemory({
  episodeId: genesisEpisode,
  ts: iso(1),
  fidelity: 0.9,
  confidence: 0.8,
  content: "用户明确表示自己言出必行。",
});
seedBelief({
  key: "trust_followthrough",
  statement: "用户说到做到，不需要额外提醒或确认。",
  strength: 0.8,
  ts: iso(1),
});
// The genesis belief still gets a provenance-bearing interpretation, marked
// 'applied' immediately (it IS the founding evidence the seeded strength
// represents, not new pending evidence to evaluate) -- consistent with
// Constitution Section 8 ("any belief without provenance must be considered
// weak"): even a Day-1 starting belief is grounded, not asserted from
// nowhere.
interpret({
  ts: iso(1),
  beliefKey: "trust_followthrough",
  statement: "初始信任基线",
  confidence: 0.8,
  memoryIds: [genesisMemory],
  status: "applied",
});

// --- Day 5: first broken commitment (isolated, ambiguous) ---------------

const e2a = recordEvent({
  ts: iso(5),
  actor: "user",
  type: "commitment",
  payload: "我明天把那份资料发给你。",
});
const e2b = recordEvent({
  ts: iso(7),
  actor: "system",
  type: "non_fulfillment",
  payload: "（两天过去，用户未发送资料，也未提及此事。）",
});
const episode2 = formEpisode({
  ts: iso(5),
  topic: "未兑现的承诺（第一次）",
  summary: "用户承诺发送资料，但两天内没有兑现，也没有主动说明。",
  eventIds: [e2a, e2b],
});
const memory2 = formMemory({
  episodeId: episode2,
  ts: iso(7),
  fidelity: 0.6,
  confidence: 0.4, // low: could be explained many other ways (forgot to mention, not urgent, etc.)
  content: "一次孤立的未兑现承诺，证据强度不高。",
});
interpret({
  ts: iso(7),
  beliefKey: "trust_followthrough",
  statement: "可能用户并不总是说到做到，但只有一次，不足以下结论。",
  confidence: 0.4,
  memoryIds: [memory2],
});
const r1 = evaluateBeliefUpdate({ beliefKey: "trust_followthrough", ts: iso(7) });
console.log("Day 7 evaluation:", r1); // expected: updated:false, insufficient_evidence

// --- Day 10: second broken commitment, this time explicitly acknowledged ---

const e3a = recordEvent({
  ts: iso(10),
  actor: "user",
  type: "commitment",
  payload: "这次我一定今天之内确认一下会议时间。",
});
const e3b = recordEvent({
  ts: iso(10),
  actor: "user",
  type: "acknowledgment",
  payload: "啊抱歉，我又忘了，最近事情太多了。",
});
const episode3 = formEpisode({
  ts: iso(10),
  topic: "未兑现的承诺（第二次，用户自行承认）",
  summary: "用户再次未能履行自己提出的承诺，并且这次主动承认自己忘了。",
  eventIds: [e3a, e3b],
  linkedEpisodeId: episode2,
});
const memory3 = formMemory({
  episodeId: episode3,
  ts: iso(10),
  fidelity: 0.9, // high: user's own explicit acknowledgment removes ambiguity
  confidence: 0.5,
  content: "第二次未兑现承诺，且用户自己确认了这一点，证据明确得多。",
});
interpret({
  ts: iso(10),
  beliefKey: "trust_followthrough",
  statement: "用户的说到做到程度低于最初设想，且这不是第一次了。",
  confidence: 0.5,
  memoryIds: [memory3],
});
const r2 = evaluateBeliefUpdate({ beliefKey: "trust_followthrough", ts: iso(10) });
console.log("Day 10 evaluation:", r2); // expected: updated:true, path: 'accumulated'

if (r2.updated) {
  updateBehavior({
    ts: iso(10),
    key: "reminder_frequency",
    value: "high",
    causeChangeEventId: r2.changeEventId,
    description: "开始更主动地确认/提醒重要事项，而不是默认对方会记得。",
  });
}

// --- Day 14: user asks why the AI's behavior changed ---------------------

recordEvent({
  ts: iso(14),
  actor: "user",
  type: "message",
  payload: "为什么你最近老是主动提醒我确认事情？以前不这样啊。",
});

console.log("\nSeed complete. Try: npm start, then GET /api/explain?key=reminder_frequency");
