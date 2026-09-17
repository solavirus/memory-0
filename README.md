# Persistent Artificial Self

## What this project is

An attempt to build and validate a **Persistent Artificial Self**: an AI
individual whose current state can always be explained by a real,
continuous, causal history — not just approximated by good retrieval.

Core thesis:

> A persistent AI is allowed to change. But any important change in what
> it currently is must be explainable through a connected chain of real,
> historical cause and effect — from what it was before, plus what
> happened to it since.

Today's version of it can differ from yesterday's. But today's version
should always be explainable as: *yesterday's version + what happened in
between.*

## What this project is not

This is explicitly **not**:

- A long-term memory system
- A relationship-memory SDK
- RAG with a chat UI on top
- A chat-log retriever or summarizer
- A vector database wrapper
- A user profiling system
- An AI companion / AI girlfriend-boyfriend template
- A character card or persona-persistence system
- A "remember everything, forever" memory framework

If the project starts to look like any of the above, that is a sign it
has drifted from its actual goal.

## Current phase

**Skipped ahead to prove the core milestone; Phases 2–6 theory docs not
yet written.**

- `PROJECT_CONSTITUTION.md` (Phase 0): substantially complete — confirmed
  answers for identity, continuity, invariants, evolvable state,
  legitimate change, identity drift, and evidence requirements.
  Falsification conditions are deliberately deferred until a prototype
  produces real observations to test against. One open question remains
  (whether a "deep forgetting" tier should exist as a legitimate identity
  discontinuity).
- `docs/episode-model.md` (Phase 1): drafted in full.
- Phase 2 (Memory Formation), Phase 3 (Remembering & Forgetting), Phase 4
  (Interpretation), Phase 5 (Self Formation), and Phase 6 (Relationship)
  have **not** been formally written up — at the project owner's explicit
  direction, work jumped to proving the milestone below before those
  theory docs exist. Treat `apps/prototype/` as a working sketch to be
  reconciled with those docs later, not as having already answered their
  questions.
- `apps/prototype/`: a minimal, runnable, zero-dependency proof of the
  project's first real milestone — a belief that weakens because of two
  real, conflicting episodes, causes a real behavior change, and can
  explain why when asked, by walking real stored provenance (not a canned
  answer). See `apps/prototype/README.md` for how to run it and for
  explicit disclaimers about what it does and doesn't prove.

## Status

Early prototype stage. One working vertical slice exists
(`apps/prototype/`) proving the core causal-chain claim end-to-end; it is
not the product described in the rest of the project brief (no real
conversational AI, no `/people` or `/talk`, no polished UI, no
production storage). See `AGENTS.md` for the constraints governing all
work on this project, and `apps/prototype/README.md` for what is and
isn't validated by the prototype.
