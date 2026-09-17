# AGENTS.md — Standing Constraints for This Project

This file defines non-negotiable constraints for anyone (human or AI)
working on this project. These are not style preferences. They encode the
project's core theoretical commitment: that an evolving AI's current
state must remain causally traceable to its real history. Violating these
principles doesn't just introduce a bug — it invalidates the thing the
project is trying to prove.

If a task seems to require violating one of these principles, stop and
raise it explicitly rather than working around it silently.

## Unconditional Principles

1. Raw historical evidence must never be silently overwritten.
2. Subjective memory must never be represented as objective fact.
3. Every derived belief must preserve provenance.
4. Important self-state changes must be causally traceable.
5. Retrieval and remembering are not assumed to be equivalent.
6. User profile and relationship history are different structures.
7. Forgetting and deletion are different operations.
8. Model-generated interpretations may be wrong and must remain revisable.
9. Do not optimize personality toward an implicit "better" state.
10. Avoid architectural complexity unless required by observed behavior.
11. Do not let summaries replace original episodes.
12. Important state changes must be inspectable.
13. Any belief without supporting provenance must be considered weak or
    provisional.
14. AI-generated memory must never silently become historical fact.
15. Identity change must be gradual enough to preserve continuity unless a
    sufficiently strong event justifies a discontinuity.

## Process Constraints

- The project proceeds in phases (see `PROJECT_CONSTITUTION.md` and
  `README.md` for current phase). Do not skip ahead into implementation,
  schema design, tool/library selection, or architecture decisions before
  the phase that authorizes them has been explicitly completed and
  confirmed.
- Every major module follows this loop, in order, without skipping steps:

  ```
  GRILL → DECISION → SPEC → IMPLEMENT → TEST → REVIEW → GRILL AGAIN → REVISE
  ```

- Design decisions with open theoretical stakes are surfaced one at a
  time, with explicit trade-offs, not batch-decided or assumed.
- Unresolved questions are recorded as explicit Open Questions, not
  silently resolved by picking a plausible-sounding default.

## Known Failure Modes to Actively Guard Against

1. The system ends up being RAG + a UI — nothing about causal continuity
   actually matters to its behavior.
2. The AI keeps summarizing its own history until it produces a
   plausible-sounding but false life story. (Guard: the Episode Ledger is
   append-only and authoritative; summaries are never a replacement for
   it.)
3. Personality change actually comes from a developer editing a prompt,
   not from anything that happened to the AI.
4. Everything is mutable — identity drifts freely with no resistance.
5. Nothing is mutable — the system degrades into a fixed persona bot.
6. A subjective interpretation gets treated as settled fact.
7. All memory stays permanently and uniformly accessible — the system is
   just a database with extra steps.
8. Old memories are deleted outright instead of losing influence/
   accessibility over time — long-term influence becomes impossible to
   model.
