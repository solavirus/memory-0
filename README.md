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

**Phase 0 — Project Constitution.**

Before any implementation, we are defining what must remain continuous
for an evolving AI to still count as the same individual. See
`PROJECT_CONSTITUTION.md` (in progress, being built through explicit,
one-at-a-time design decisions — see `AGENTS.md` for the working method).

## Status

Pre-implementation. No application code, schema, or architecture has been
written yet, and none should be, until `PROJECT_CONSTITUTION.md` is
confirmed. See `AGENTS.md` for the constraints governing all future work
on this project.
