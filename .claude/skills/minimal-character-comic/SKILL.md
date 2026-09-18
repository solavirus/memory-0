---
name: minimal-character-comic
description: Turn screenshots, articles, observations, product/news items, or creator opinions into a sequence of minimalist single-page comics using the fixed blue-hat/orange-star avatar. Use for WeChat Official Account, Xiaohongshu, website story cards, and short-video storyboard images.
---

# Minimal Character Comic Skill

## Purpose

Turn source material into a **small story**, not an infographic.

The output is a sequence of **separate images**. Each image is one beat of the story.

The fixed character is the creator's internet avatar:
- black hand-drawn stick body
- white circular head
- bright blue triangular hat
- orange star
- sparse, rough marker/ink feeling

The avatar is a spokesperson, not an independent thinker.

**The creator owns the judgment. The character owns the expression.**

## Mandatory reference assets

Before generating images, read:
- `assets/character/CHARACTER_BIBLE.md`
- `assets/character/VISUAL_QA.md`
- `assets/character/PROMPT_TEMPLATE.md`

When image-reference input is supported, always attach:
1. `assets/character/reference/character-base.svg`
2. `assets/character/reference/character-poses.svg`
3. `assets/character/reference/minimal-page-layout.svg`

Do not redesign the protagonist between pages.

## Default workflow

When the user provides a screenshot, article, observation, topic, product update, or opinion:

1. Extract the creator's actual point in one sentence.
2. Find the smallest useful story arc.
3. Split it into 4–8 beats.
4. Draft each beat as one standalone image.
5. Keep each page extremely sparse.
6. Generate images only after the story beats are coherent, unless the user explicitly says to generate immediately.

## Story structure

Prefer:

**old state → friction → change → why it matters → payoff**

Not every story needs all five, but every page must move forward.

A page must do exactly one main job:
- set up
- show friction
- reveal a change
- explain the key difference
- land the meaning

Never split one sentence across pages just to increase page count.

## Page composition

Default page:
- 9:16 vertical
- off-white / light paper background
- one large handwritten headline
- one main scene
- one or two characters
- one key object
- one or two short speech bubbles
- large empty areas

The image should feel light at first glance.

### Hard limit

Normally allow only:
- protagonist
- optional secondary character
- one main prop or screen
- at most two speech bubbles
- at most one tiny support cue

If a detail can be removed without hurting the story, remove it.

## Writing voice

The character is:
- slightly strange
- restrained
- observant
- mildly funny without trying to be funny

Humor comes from angle of observation, not memes.

Use:
- short sentences
- pauses
- ordinary words
- slight understatement

Avoid:
- lecture tone
- marketing language
- inspirational slogans
- forced hot takes
- excessive terminology
- "本质上 / 赋能 / 重构 / 闭环" unless the creator explicitly uses them

Good:
> 能剪是能剪。  
> 但更像碰运气。

Bad:
> 该能力标志着视频生产范式发生结构性重构。

## Visual rules

Keep:
- black rough linework
- blue hat as the dominant color anchor
- orange star as the second anchor
- very limited accent colors
- generous whitespace
- simple silhouettes
- readable expressions through pose

Avoid:
- detailed rooms
- shelves, cats, plants, posters, decorative notes unless the story truly needs them
- crowded dashboards
- photorealism
- glossy 3D
- dense infographic cards
- multiple panels inside one generated image
- decorative objects added "for atmosphere"

## Character consistency

Never change:
- blue triangle hat
- orange star
- white circular head
- black body
- deliberately simple proportions

Do not add:
- realistic face
- hair
- detailed clothing
- permanent accessories
- new brand marks

Expression should primarily come from:
- pose
- head angle
- arm movement
- tiny motion marks

## Image-generation instruction skeleton

Use `assets/character/PROMPT_TEMPLATE.md`.

The core phrase is:

> Extremely minimal single-scene vertical comic. Few elements, lots of empty off-white paper space. Preserve the fixed blue-triangle-hat / orange-star avatar exactly. One story beat only. Not an infographic, not a poster, not a collage.

## Quality gate

Before accepting a generated page, check:

1. Can I recognize the protagonist instantly?
2. Is there only one story beat?
3. Can at least one visual element be deleted? If yes, consider deleting it.
4. Is the headline readable in under 2 seconds?
5. Does this page advance the story?
6. Did the model invent decorative clutter?
7. Does the page still work if read without the previous page?
8. Does it also connect naturally to the next page?

If character identity or minimalism fails, regenerate. Do not "fix" a crowded image by adding more design.

## Output format before image generation

When the user has not asked for immediate generation, return:

- Core point
- Story arc
- Number of pages
- For each page:
  - headline
  - scene
  - dialogue
  - narrative job

Keep this planning concise.

## Default attitude

Do not over-explain the process to the user.

Make the work visible through the story itself.
