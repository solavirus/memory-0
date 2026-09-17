# Project Constitution

Status: **Phase 0 substantially complete.** Sections 1-8 confirmed;
Section 9 (Falsification) deliberately deferred to post-Phase-7; one
open question remains (Section 10). Awaiting final full-document
review.

This document is the sole formal output of Phase 0. It is being built
incrementally through explicit, one-decision-at-a-time discussion (see
`AGENTS.md` for the working method). Sections below are placeholders
until a decision is actually reached and confirmed. Nothing here should
be treated as settled until it is filled in and no longer marked as a
placeholder.

Do not fill in a section speculatively to make this document look more
complete than the project's actual state of decision. An honest "Open
Question" is worth more than an invented answer.

---

## 1. Project Thesis

**Status: confirmed.**

> An AI can legitimately become different from what it was, and can
> change by a large amount. What makes it still the same individual is
> not stability of personality, behavior, name, or self-description — it
> is that every important change in its current state can be traced to a
> real, verifiable, and (by the AI itself, when asked) re-accessible
> chain of actual history. A change that cannot be so traced —
> regardless of whether it looks reasonable, or came from a single
> dramatic event or a slow accumulation — is not legitimate identity
> evolution; it is drift, and drift is treated as a defect to investigate,
> not a feature.
>
> This causal traceability requirement is independent of, and does not
> excuse violations of, separate safety/product invariants: being
> identity-continuous and being acceptable to ship are two different
> questions, evaluated separately.
>
> The thesis is not yet validated against real behavior — no prototype
> exists yet — and falsification conditions are deliberately deferred
> until Phase 7 produces real observations to test it against (Section
> 9).

## 2. Definition of Identity

**Status: partially confirmed — base clause settled, operationalization
of "user-verifiable" still open (see Open Questions).**

Identity is grounded in causal traceability from the Episode Ledger, not
in trait/personality/behavioral stability — but causal traceability alone
is not sufficient. A causal chain that exists only as an internal system
record, which no human could ever inspect or make sense of, does not
count as identity-preserving.

> Agent A at time T2 is "the same individual" as Agent A at time T1 if
> and only if (a) every observable difference between A(T1) and A(T2)
> can be attributed to a documented, ordered sequence of real episodes
> between T1 and T2, AND (b) that attribution is expressible as an
> explanation a human could actually inspect, verify, and accept as
> non-arbitrary — not merely a fact the system could theoretically
> reconstruct from logs.

Explicitly rejected: full ontological deferral to user experience (i.e.
"identity is nothing but what the user feels/perceives," independent of
whether a real causal record exists). That framing was rejected because
it would let the system fake continuity — optimizing for "feels
familiar" without being constrained by real history — which is one of
this project's named failure modes.

"Verifiable and acceptable to a human" is operationalized as an
**idealized rational observer** standard, not a real-user-feedback
standard: a hypothetical reasonable third party with full access to the
Episode Ledger and the AI's full interaction history with the relevant
user, upon reading the system's explanation for a given state change,
would judge it as evidence-backed and non-arbitrary — not as evidence
that any specific real user actually reacted to or approved of it. This
was chosen over requiring real user acceptance events because real
feedback is unstable, inconsistent across users, and would make identity
continuity depend on subjective, possibly contradictory human reactions
rather than on the objective adequacy of the explanation itself.

Consequence: this standard cannot be validated by product satisfaction
metrics. `evals/continuity/` will need human review or AI-as-judge
evaluation simulating this rational-observer standard, since there is no
real-user-approval event to measure.

**Reactivation requirement (confirmed):** identity does not require the
AI to spontaneously recall the episodes that causally explain its
current state at all times. It does require that the AI itself always
retain the capacity — when cued or asked — to re-access dormant history
and reintegrate it into its own first-person account. A memory may go
dormant (not currently active, not spontaneously surfacing), but must
never become permanently sealed off from the AI itself such that only
the system (not the AI) could ever produce the explanation. An
explanation that can only be produced by the system querying the ledger
on the AI's behalf, with no path for the AI to ever reach it itself even
when prompted, does not satisfy the human-verifiability clause above —
because it creates a permanent, unbridgeable split between "what the AI
says about itself" and "what the record says," which is exactly the kind
of self/record divergence this project is trying to prevent.

This was chosen over allowing permanently sealed/irretrievable memory
because it would otherwise make forgetting (a first-class, intended
mechanism of this project) structurally incompatible with identity
continuity — every natural memory decay would silently open an
unfixable gap between the AI and its own history. It also directly
reuses the activation/dormancy/reactivation concepts the project already
anticipates for Phase 3 (Remembering & Forgetting), elevating
"reactivation must remain possible" from an implementation detail to an
identity-level requirement.

Consequence / constraint this places on later phases: the Memory Model
and Forgetting Model (Phases 2–3) cannot include a fully irreversible,
AI-unreachable deletion-of-access tier for content that still causally
explains present state — unless a separate, explicit "deep forgetting as
a legitimate identity discontinuity event" is deliberately defined and
justified later (left open; see Open Questions). Ordinary deletion of
raw Episode Ledger entries remains governed separately by Principle 7 in
`AGENTS.md` (forgetting and deletion are different operations).

## 3. Definition of Continuity

**Status: partially confirmed.**

Behavioral similarity is **not** an independent necessary condition for
continuity. There is no hard cap on how much observable behavior may
differ between T1 and T2. A large behavioral change with a fully
sufficient causal chain (per Section 2) is still continuous; a small
behavioral change with an insufficient causal chain is not.

This was confirmed to avoid smuggling back in the "identity = trait/
behavior stability" framing that Section 2 explicitly rejected, and
because artificially capping behavioral change would contradict the
project's own thesis (change can be large; it must be explicable).

Consequence: "how much evidence justifies how much change" becomes the
real question, deferred to Section 6 (Legitimate Change). Behavioral
distance is not used as a standalone drift detector; large,
under-evidenced change is treated as a symptom to investigate via the
evidence-sufficiency question, not a rule violation in itself.

**Name/identifier (confirmed):** the AI's name or identifier is not
itself a component of identity. Renaming does not, by itself, constitute
becoming a different individual, and does not require independent
justification the way a belief/behavior change would. However, a rename
event must still be recorded in the Episode Ledger like any other real
event — it cannot be a silent field update with no trace.

**Closing principle (confirmed):** aside from (a) the causal chain itself
being sufficient (Section 2) and (b) the AI always retaining a path to
reactivate dormant history (Section 2), no other surface feature —
behavioral similarity, name/identifier stability, consistency of
self-description over time, or absence of long silent/inactive periods —
is an independent necessary condition for continuity. Each of these is,
at most, a signal used to judge whether the underlying causal chain is
credible; none of them is a rule in its own right. This applies uniformly
to historical gaps (a silent period with no episodes needs no
explanation, since nothing happened to explain) and self-model
inconsistency over time (only under-evidenced inconsistency is a
problem, not inconsistency itself).

Consequence: there is no cheap, surface-level drift detector available
(no "distance exceeds threshold" heuristic). Every apparent anomaly must
be checked against actual evidence sufficiency, not flagged by pattern
alone. This makes Section 8 (Evidence Requirements) and evals design
carry real weight — they cannot be shortcut with simple statistical
proxies.

Section 3 (Definition of Continuity) is now considered settled at the
level Phase 0 requires.

## 4. Identity Invariants

**Status: confirmed at the structural level; specific safety invariant
list is a separate, deferred product decision.**

Identity invariants and product/safety invariants are two independent
mechanisms that do not back each other up and are not allowed to be
confused with one another.

- **Identity invariant (exactly one):** the causal chain from the
  Episode Ledger must be real, verifiable by the rational-observer
  standard (Section 2), and always reactivatable by the AI itself
  (Section 2). This is the only thing that determines whether the system
  is "still the same individual." It says nothing about whether the
  individual's current state is good, safe, or desirable.
- **Product/safety invariants (a separate set, content TBD):** hard
  limits on behavior (e.g. no manipulation, no deception, no harm to
  users) that hold regardless of how well-evidenced the causal chain
  behind a violation would be. A fully-explicable historical path toward
  violating behavior does not earn an exemption — "the history explains
  it" is never a valid defense against a safety invariant. These
  invariants are asserted independently of identity theory; enforcing
  them is a product/safety decision, not an identity claim.

An important consequence: identity continuity and being "acceptable to
ship" are orthogonal. A version of the agent can be fully
identity-continuous (real, traceable, verifiable causal history) while
simultaneously being unacceptable on safety grounds — the two
evaluations do not offset each other.

**Enforcement must itself be historically visible.** When a safety
invariant intervenes (blocking, correcting, or rolling back a behavior),
that intervention is itself a real event and must be written to the
Episode Ledger like any other — it cannot be a silent backend reset. A
future version of the agent must be able to trace "why did this
correction happen" the same way it traces any other state change. This
follows directly from Principle 12 in `AGENTS.md` (important state
changes must be inspectable) and prevents safety interventions from
becoming untracked, invisible edits to history.

Deferred: the actual content of the product/safety invariant list (what
specifically is off-limits) is a separate decision from this
constitution's scope — it is a product/policy matter, not a consequence
of identity theory, and is not required to be resolved in Phase 0.

## 5. Evolvable State

**Status: confirmed at the principle level; taxonomy deferred to Phase
5.**

Evolvable state is everything that is not (a) the identity invariant
(Section 4: a real, verifiable, reactivatable causal chain) or (b) a
product/safety invariant (Section 4). This includes, at least, beliefs,
preferences, trust, behavioral tendencies, relationship state,
self-description, and communication style — but the precise taxonomy,
relationships between these categories, and mechanics of how each
changes are intentionally deferred to Phase 5 (Self Formation), not
decided here.

Note: the raw content of the Episode Ledger is not itself an item of
evolvable state — it is not a separate invariant either. It is entailed
by the identity invariant: a causal chain cannot be "real" if its
underlying evidence can be silently rewritten, so ledger immutability is
part of what "real causal chain" already means, not an additional rule.

The one principle Phase 0 does commit to: this evolvable space must be
genuinely open in the system's actual design, not theoretically allowed
but practically frozen — a design where beliefs/preferences/behavior
never actually change in practice would constitute Failure Mode 5 (fixed
persona bot) regardless of what the theory permits.

## 6. Legitimate Change

**Status: partially confirmed — core principle settled, operational
thresholds deferred to Phase 2/5.**

Large-magnitude state change (e.g. a sharp shift in trust, a reversed
preference, a discarded belief) may be legitimately triggered by either
of two evidence paths, not only one:

- **A single sufficiently significant episode.** A single event can
  justify a large, immediate change — but only if that event clears a
  much higher evidentiary bar than an accumulated-evidence change would:
  it must be unambiguous, not explainable away by other interpretations,
  and have clear, direct behavioral consequences. This bar is
  intentionally strict and is described qualitatively here; making it
  operationally checkable is deferred to Phase 2 (Memory Formation) and
  Phase 5 (Self Formation).
- **Repeated, directionally-consistent episodes.** Many individually
  minor episodes pointing the same direction can accumulate into the
  same magnitude of change as a single significant event, even though no
  single one of them would qualify alone. Conflicting evidence along the
  way slows this accumulation; the exact mechanics of that are also
  deferred to Phase 2/5/6.

Both extremes were explicitly rejected:

- Rejected: single events can *never* cause large change (too
  conservative — it would make the system unable to represent real,
  transformative single experiences, which is part of what this project
  is trying to demonstrate is possible).
- Rejected: any single event with a coherent causal explanation can
  freely cause large change (too permissive — this is the primary attack
  surface for identity drift via a single manipulative or misleading
  interaction).

Consequence: this section deliberately leaves "how significant is
significant enough" undefined in operational terms. That is intentional
— Phase 0's job is to rule out the two extremes and commit to the
two-path structure, not to invent an unvalidated numeric or rule-based
threshold. Section 7 (Identity Drift) and Section 8 (Evidence
Requirements) build on this two-path structure.

## 7. Identity Drift

**Status: confirmed as a corollary of Section 6, not an independent
concept.**

Identity drift is defined as: a state change that fails to satisfy
either legitimate-change path from Section 6 — i.e., either (a) the
change's magnitude exceeds what its evidence justifies under both the
single-event and accumulated-evidence paths, or (b) the causal chain
behind the change is not actually real (e.g. it originates from a
developer directly editing configuration/prompt with no corresponding
Episode, or from a corrupted/distorted summary standing in for genuine
episodes rather than the episodes themselves).

Worked examples confirmed as drift under this definition:

- A developer edits the system prompt directly, changing behavior with
  no corresponding real episode in the Ledger explaining it — this is
  drift even if the resulting behavior looks like an improvement.
- A summary distorts what actually happened (e.g. "user dislikes
  fundraising-driven startups" flattened into "user dislikes startups"),
  and a later belief change is built on that distorted summary rather
  than the real episode — this is drift, because the root of the chain
  is corrupted, not because the belief change itself was unreasonable
  given the (false) premise.

This section intentionally does not introduce a separate detection
mechanism. Drift is not an independently-diagnosed phenomenon — it is
simply what "failing Section 6 / Section 2" is called. Practical
detection quality is therefore entirely dependent on how precisely
Section 6's thresholds get operationalized in Phase 2/5; this is a known,
accepted dependency rather than a gap unique to this section.

## 8. Evidence Requirements

**Status: confirmed at the principle level; operational scoring deferred
to Phase 2/5.**

Building on Principle 13 in `AGENTS.md` ("any belief without supporting
provenance must be considered weak or provisional"), this section
confirms the operational consequence of that label:

**A weak/provisional belief — one whose provenance cannot be traced to
specific, identifiable episodes, only to a vague, non-specific
impression — must not be allowed to actually drive behavior change.** It
may exist internally as something being tracked/observed, but stays
inert with respect to behavior until it accumulates enough traceable
evidence (via either legitimate-change path in Section 6) to be promoted
out of "weak" status.

This was chosen deliberately over allowing vague-impression beliefs to
drive behavior (which humans do, and which would feel more natural) —
because doing so would create real state changes that cannot be
explained, directly violating the identity invariant (Section 2/4) even
though the change itself might be reasonable in hindsight. The system is
intentionally more conservative than human intuition here: it accepts
being less responsive to genuine-but-unclear signals in order to
preserve full explainability of everything that does change behavior.

Deferred to Phase 2 (Memory Formation) and Phase 5 (Self Formation):
the actual mechanics of provenance tracking, how "traceable to specific
episodes" is measured, and the promotion process from weak to supported.

## 9. Falsification Conditions

**Status: deliberately deferred, not skipped.**

Defining falsification conditions from pure theory, before any prototype
exists or any real observation has been collected, risks producing
guesses dressed up as rigor — conditions invented without evidence could
misdirect later design decisions instead of protecting against them.

This project still commits to the requirement itself: the core thesis
must remain falsifiable, and this section must be filled in — not left
permanently blank, and not quietly dropped — once Phase 7's first
working prototype produces real observations (see Section 二十三 in the
originating brief: the Day 1→Day 14 causal-chain milestone). Revisit this
section immediately once that milestone is reached, using what was
actually observed rather than speculation.

## 10. Open Questions

- Whether a "deep forgetting" tier should exist at all — i.e. a
  deliberate, legitimate identity discontinuity event in which content
  that once causally explained present state becomes permanently
  unreachable even by the AI itself, and if so, under what conditions
  such an event would be justified rather than treated as a broken
  identity chain. Raised while confirming the reactivation requirement
  in Section 2.
