# Project Constitution

Status: **DRAFT — Phase 0 in progress.**

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

_Not yet finalized._

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

_Not yet finalized._

## 4. Identity Invariants

_Not yet finalized. Must distinguish identity invariants from
product/safety invariants._

## 5. Evolvable State

_Not yet finalized._

## 6. Legitimate Change

_Not yet finalized._

## 7. Identity Drift

_Not yet finalized._

## 8. Evidence Requirements

_Not yet finalized._

## 9. Falsification Conditions

_Not yet finalized. What observation(s) would show the core thesis is
wrong?_

## 10. Open Questions

- Whether a "deep forgetting" tier should exist at all — i.e. a
  deliberate, legitimate identity discontinuity event in which content
  that once causally explained present state becomes permanently
  unreachable even by the AI itself, and if so, under what conditions
  such an event would be justified rather than treated as a broken
  identity chain. Raised while confirming the reactivation requirement
  in Section 2.
