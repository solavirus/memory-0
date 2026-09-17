# Episode Model

Status: **DRAFT — complete, pending final acceptance review.**

This document is the formal output of Phase 1 (see `PROJECT_CONSTITUTION.md`
for the identity/continuity theory this builds on, and `AGENTS.md` for the
working method). Per the project owner's direction, Phase 1 decisions
below were made by Claude's own judgment rather than through per-question
confirmation; each decision states its reasoning, rejected alternatives,
and cost so it can be reviewed and revised as a whole.

Core question this phase answers: **what counts as "a real experience"?**
Everything upstream of memory formation depends on this being precise —
if the atomic unit of history is wrong, nothing built on top of it
(memory, interpretation, belief, self) can be trusted.

---

## 1. Core Vocabulary

**Decision: a minimal three-primitive architecture — Event, Episode,
Conversation — with "Interaction," "Observation," and "Correction" kept
as descriptive labels/subtypes rather than separate persisted structures.**

Per `AGENTS.md` Principle 10 ("avoid architectural complexity unless
required by observed behavior"), the vocabulary is kept to the smallest
set of *distinct storage-level primitives* that actually do independent
work. Everything else is a label applied to instances of those
primitives.

- **Event** (atomic, persisted, append-only): the smallest indivisible
  unit of something that actually happened. Every Event has: an actor
  (user / AI / tool / system), a timestamp, a content payload, a
  modality, and a type. Examples: "user said X," "AI said Y," "AI
  invoked tool Z," "tool returned result W," "user did not respond to a
  specific open question within N days" (see Section 8). Events are
  never edited or deleted once written — this is not a new rule, it is
  `AGENTS.md` Principle 1 applied at the storage layer.
- **Episode** (semantic, persisted): a cluster of one or more Events that
  share a coherent topic/thread. This is the unit Phase 2 (Memory
  Formation) operates on — the question "did this become a memory?" is
  asked per-Episode, not per-Event or per-Conversation. See Section 2 for
  boundary rules.
- **Conversation** (session-level, persisted as a lightweight grouping
  key): a continuous, uninterrupted stretch of dialogue bounded by
  connection start/end. A Conversation may contain multiple Episodes
  (per the example in Section 2). It exists purely to let the system (and
  a developer inspecting the ledger) reconstruct "what happened in one
  sitting" — it is a UI/reconstruction convenience, not a unit of
  meaning, and Phase 2 must never treat it as one.
- **Interaction** (descriptive label, not persisted separately): the
  natural pairing of a user turn and the AI's response (plus any tool
  Events in between). Useful for describing the model; not a distinct
  stored object, since it does no work that Event-with-actor-metadata
  doesn't already do.
- **Observation** (descriptive label, i.e. an Event subtype): an Event
  with no reciprocal exchange — a fact recorded without a direct
  back-and-forth (e.g. a passive signal, a scheduled check-in with no
  reply expected). Stored as an ordinary Event; "Observation" just names
  the pattern where there's no paired response.
- **Correction** (descriptive label, i.e. an Event subtype): an Event
  whose content revises a previously recorded fact or claim. See Section
  5 — corrections are new Events, never edits to the original.

**Rejected alternative:** treating Event, Episode, Interaction,
Conversation, and Observation as five independent persisted object types
with their own schemas. Rejected because Interaction and Observation
don't need independent identity or lifecycle — they're fully describable
as Events with the right metadata, and inventing separate tables/objects
for them would be complexity not justified by any actual requirement
(Principle 10).

## 2. Episode Boundaries

**Decision: Episode boundaries are semantic (topic/thread-based), not
session-based. A single uninterrupted Conversation can and often will
contain multiple Episodes.**

### Example

A user has one continuous, 20-turn conversation: first about a stressful
situation at work, then about a relationship problem, then a passing
question about dinner. This is **one Conversation** but **three
Episodes** — because the three topics share no meaningful continuity of
subject, even though nothing interrupted the conversation itself.

### Why

Session-based boundaries (one Conversation = one Episode) would dilute
provenance: if the AI's view of the user's stress tolerance shifts
because of the work conversation, and the Episode boundary spans all
three topics, "why did this belief change" would point at a block of
content two-thirds of which is irrelevant. This directly undermines the
causal-traceability requirement `PROJECT_CONSTITUTION.md` Section 2
establishes as the core identity invariant. Fine-grained, semantically
coherent Episodes keep the pointer from a belief back to its evidence
precise.

### Boundary heuristic

A new Episode begins when any of the following holds:

1. **Topic/intent shift** — the thread of conversation moves to a
   subject with no meaningful continuity to what preceded it.
2. **Significant time gap** — the Conversation resumes after a long
   pause (exact threshold left to Phase 2/implementation; not decided
   here — see Open Questions). A resumed topic after a long gap still
   starts a new Episode, but should be **linked** to the earlier one
   (see Section 3) rather than merged into it.
3. **Explicit boundary signal** — the user or AI explicitly marks a
   change of subject.

Boundary detection is inherently approximate, not deterministic. Default
bias: **prefer over-segmentation to under-segmentation.** Splitting one
coherent thread into two adjacent Episodes is a minor, correctable cost
(they can be linked); merging two unrelated threads into one Episode
pollutes provenance in a way that is much harder to undo later, since it
requires re-deriving which parts of a blended Episode actually supported
a given belief.

**Rejected alternative:** session-based boundaries (Conversation =
Episode). Rejected for the reason above — it optimizes for
implementation simplicity at the direct expense of the project's central
requirement (precise causal traceability).

## 3. Same-Day / Related-Event Merging

**Decision: no automatic merging by calendar proximity. Related Episodes
are connected via explicit links, not folded into a single unit.**

Two Episodes that happen on the same day, or that are topically related
but separated in time, are **not** automatically merged into one larger
unit. Instead, an Episode may carry a reference to a related prior
Episode (e.g. "continuation of Episode #12," "revisits the same topic as
Episode #7"). This preserves each Episode's independent provenance while
still letting the system (and a human reading `/history`) traverse
related history as a thread.

### Why

Calendar-based merging (e.g. "everything from the same day is one unit")
is an arbitrary criterion that has nothing to do with actual semantic or
causal relatedness — two unrelated conversations that happen to occur on
the same day would get glued together for no principled reason, and two
deeply related conversations three days apart would stay artificially
separate. Linking, instead of merging, keeps each Episode's boundaries
determined by Section 2's semantic criterion only, while still letting
the system express "these are related" as its own explicit, inspectable
fact — which is itself just another Event/relationship, consistent with
Principle 12 (important relationships must be inspectable, not implicit).

**Rejected alternative:** merging same-day or topically-similar Episodes
into a single compound unit. Rejected because it reintroduces exactly
the provenance-dilution problem Section 2 was designed to avoid, just at
a different granularity (day-based instead of session-based).

## 4. Multi-Modal Events

**Decision: modality is a property of an Event, not a different
architecture. No special-casing.**

An Event can carry any content type (text, image, audio, tool
output/action) as its payload. Episodes can freely mix modalities. This
requires no separate model — the Event/Episode structure defined in
Section 1 already accommodates it via a `modality` field on Event.

One distinction matters: if the AI generates an interpretation of
non-text content (e.g. a caption or description of an image), that
interpretation is **not** stored as if it were the raw fact. The raw
asset is the Event's payload; the AI's reading of it is a separate,
linked record that belongs to the Interpretation layer (Phase 4) and is
explicitly marked as an interpretation, not as ground truth — this is a
direct application of `AGENTS.md` Principle 2 (subjective memory must
never be represented as objective fact) to non-text content.

## 5. Corrections

**Decision: a correction is a new Event referencing what it corrects.
The original Event is never edited or removed.**

When a user (or the system) corrects something the AI previously said or
recorded, that correction is written as a new Event with an explicit
"corrects" relationship pointing at the original Event. The original
Event remains in the Ledger exactly as it was. Downstream (Interpretation
layer, Phase 4), the correction is generally treated as taking precedence
for future reasoning — but the raw history still shows both "the AI once
said/believed X" and "then was corrected to Y," which is itself
meaningful history (it's evidence the AI can be wrong and can update,
which is a real, inspectable fact about it, not something to erase).

This is a direct, non-optional consequence of `AGENTS.md` Principle 1
(raw historical evidence must never be silently overwritten) — a
correction is new evidence, not a retroactive edit.

## 6. Does the AI's Own Behavior Count as an Event?

**Decision: yes. AI utterances, decisions, and actions are Events,
symmetric with user-originated Events.**

If the AI's own behavior weren't part of the Ledger, the causal chain
required by `PROJECT_CONSTITUTION.md` Section 2 couldn't explain the
AI's own behavior changes — there would be a gap in exactly the kind of
evidence the whole project depends on. Every Event carries an `actor`
field; "AI" is a valid actor on equal footing with "user," "tool," and
"system."

## 7. Do External Tool Execution Results Count as an Event?

**Decision: yes. A tool invocation and its result are Events, attributed
to actor "tool," linked to the Interaction that triggered them.**

Tool results can introduce new information that legitimately shapes
belief (e.g. looking something up and finding a fact that contradicts a
prior assumption). If tool results weren't part of the Ledger, a belief
change caused by one would be untraceable — violating the same
causal-completeness requirement as Section 6. Tool invocation and tool
result are modeled as two Events (request, then response), not one, so
that a tool call that fails, times out, or returns something unexpected
is itself visible as a distinct fact.

## 8. Does Silence / Non-Action Count as an Event?

**Decision: only when the silence is informative relative to a specific
prior expectation. Ordinary silence is not an Event.**

`PROJECT_CONSTITUTION.md` Section 3 already establishes that a quiet
period with nothing happening needs no explanation and is not a
continuity problem — most silence is simply not an Event, and does not
get written to the Ledger.

The exception: if the AI asked a specific question, made a specific
prediction, or otherwise created a specific expectation, and that
expectation goes unmet (e.g. "user did not respond to a direct question
within N days," "user never returned to a topic they said they would
follow up on"), that non-response is recorded as an Event. The
distinction is not "did something happen" but "was there a specific,
identifiable expectation this Event's absence speaks to." This matters
because such non-responses can be legitimate evidence (e.g. contributing,
with appropriate weight and provenance, to a belief like "user tends to
avoid this topic") and evidence needs to be in the Ledger to be
traceable at all, per Section 8 of the Constitution.

**Rejected alternative:** never recording silence as an Event.
Rejected because it would make a real, evidentially meaningful pattern
(consistent avoidance) permanently untraceable — any belief formed from
it would have no provenance and would violate Constitution Section 8
outright.

**Rejected alternative:** recording all silence/inactivity as Events.
Rejected as unbounded and mostly meaningless — most gaps carry no
information and logging them would flood the Ledger with noise that
provides no evidentiary value, working against Principle 10.

## 9. Conflicting Versions of the Same Event

**Decision: both versions are retained as separate, linked Events with
an explicit "conflicts-with" relationship. The Ledger never silently
picks a winner.**

When two accounts of the same event disagree (e.g. the user later
disputes what was said, or a tool record contradicts a user's
recollection), neither version is deleted or treated as replacing the
other at the Ledger level. Both are stored, explicitly marked as
conflicting with each other. Resolving *which version to weight more*
when forming beliefs or interpretations is a Phase 4 (Interpretation)
problem, handled with confidence levels — never a Phase 1/Ledger-level
decision.

### Why

This follows directly from `AGENTS.md` Principle 1 and Principle 8:
raw evidence isn't overwritten, and interpretations (including "which
version is more likely true") are revisable, not baked into the fact
record. If the Ledger picked a winner silently, a later re-interpretation
that favored the other version would have no evidence to point back to.

## 10. Open Questions

- **Time-gap threshold for Episode boundaries** (Section 2): how long a
  pause counts as "significant enough to start a new Episode even on the
  same topic" is left unspecified — an operational value is deferred to
  implementation/Phase 2, since setting it from theory alone would be a
  guess, not a grounded decision (consistent with how
  `PROJECT_CONSTITUTION.md` Section 6 deferred its own thresholds).
- **Topic-shift detection method** (Section 2): whether this is done via
  an LLM judgment call, embedding-distance heuristics, or an explicit
  rule set is an implementation decision for later phases, not a Phase 1
  theory question.
- **"Specific expectation" threshold for silence-as-Event** (Section 8):
  what qualifies as a specific enough expectation to make its absence
  meaningful (vs. a passing remark that creates no real expectation) is
  left for Phase 2 to operationalize.
