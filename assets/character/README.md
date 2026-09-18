# Character Asset Library

This directory is the visual source of truth for the creator avatar.

## Start here

For story-comic generation:

1. Read `CHARACTER_BIBLE.md`.
2. Read `VISUAL_QA.md`.
3. Use `PROMPT_TEMPLATE.md`.
4. Load references from `reference/`.
5. Follow `asset-manifest.yaml`.

## Repository skill

Claude Code repo skill:

`.claude/skills/minimal-character-comic/SKILL.md`

## Reference set

- `reference/character-base.svg` — primary character identity
- `reference/character-poses.svg` — allowed pose vocabulary
- `reference/minimal-page-layout.svg` — target page density and whitespace
- `reference/helper-robot.svg` — optional recurring AI helper

## Why the library is small

A large reference folder is not automatically better.

For this character, consistency comes from a few strong anchors:
- silhouette
- color anchors
- restricted pose vocabulary
- low scene density
- human-approved reference promotion

Too many generated references create style drift.

So the default is: **small, explicit, approved**.
