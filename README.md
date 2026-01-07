# cr-app (Cranium Tribute)

cr-app is a tribute web app inspired by the classic party game format. It delivers four color-coded challenge categories, a randomized card draw per category, and a simple way to grow the card library over time. The project avoids trademarked names and keeps all data local so the site can be built and hosted as static files.

The current focus is documentation and requirements. Implementation will follow.

## Goals
- Provide four category experiences with the same colors: blue, red, green, yellow.
- Support i18n (Spanish + English first) for UI and card content.
- Allow modular growth: new cards, new groups, and future new category types.
- Keep card data inside the repo (no external database).

## Repository notes
- `card_references/` contains reference images and OCR text outputs (`.txt`) for each card face.
- `requirements.md` defines the product roadmap, epics, and user stories.
- `agents.md` explains constraints and project rules for contributors.

## Running locally
This project uses Vite + React + TypeScript.

```bash
pnpm install
pnpm dev
```

## Data and authoring
Card authoring is done through a local CLI script that can:
- List available cards and groups.
- Add a new card in one language or many.
- Query by category, language, or group set.

The CLI is documented in `docs/card-authoring.md`.

## Category color mapping
This tribute uses color names in the code. The colors correspond to the original category labels in the classic game:
- Blue: creative category (original name: Gato Creativo).
- Red: trivia category (original name: Dato Nauta).
- Green: performance category (original name: Star Estelar).
- Yellow: wordplay category (original name: Lombri Letras).

## Planned CLI scripts
These scripts will be added so cards can be managed without editing code:
- `pnpm cards:add` (create a new card)
- `pnpm cards:update` (update an existing card)
- `pnpm cards:remove` (remove a card)
- `pnpm cards:list` (query by category, language, or group)

## Legal note
This project is a tribute inspired by a well-known board game format. It does not use trademarked category names or brand assets.
