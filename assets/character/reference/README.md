# Reference Assets

These files exist to reduce character and layout drift.

## Mandatory identity anchors

### `character-base.svg`
Use as the primary identity reference:
- silhouette
- hat
- star
- body simplicity

### `character-poses.svg`
Use as a pose vocabulary, not as literal required compositions.

### `minimal-page-layout.svg`
Use as a density/layout reference:
- large whitespace
- one headline
- one scene
- one or two bubbles
- one key prop

## Priority order

When style signals conflict:

1. character-base.svg
2. CHARACTER_BIBLE.md
3. minimal-page-layout.svg
4. character-poses.svg
5. generated prior page

The generated prior page is useful for continuity, but it must never override the fixed character identity.

## Important

Do not train the style by accumulating every generated output.

Only promote a generated page into this reference folder after a human explicitly approves it as a good visual anchor. Otherwise mistakes will compound.
