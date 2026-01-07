# Requirements and Roadmap

## Product vision
Build a static web app that serves randomized challenge cards in four color-coded categories. The experience is inspired by a classic party game format but uses new names and original content. The app is designed for long-term growth with modular data, rich grouping, and bilingual content (Spanish + English).

## Scope and constraints
- Static site build; no external database or API.
- Card data stored in-repo (TypeScript or JSON).
- UI and card content must support i18n.
- Category colors must match the original palette: blue, red, green, yellow.
- Avoid trademarked names, logos, or descriptions.
- Atomic Design architecture for the UI (atoms, molecules, organisms, templates, pages).
- OCR references already exist in `card_references/` as `.txt` files next to the images.
- Some card types share a fixed activity description; store this once per type (not per card).
- "All play" variants for Blue and Green exist conceptually and must be modeled even without reference images.

## Glossary (working terms)
- Category: The four main experiences (Blue, Red, Green, Yellow).
- Card type: A sub-variant inside a category (example: DibuNoveo).
- Challenge: The variable part of a card (prompt + optional hint + answer).
- Group: A tag used to define sets (e.g., Colombia, Pop 2024, World 2020).
- All play: Variant where all teams participate; winner receives bonus move and the drawing team draws again if they did not win.

## Epics and user stories

### Epic 1: Data model and storage
As a content editor, I can store cards in a local file so builds remain static and portable.
Acceptance:
- Card data lives in the repo.
- Shared activity descriptions are stored once per card type.
- Cards can include multilingual content per field.
- Cards can declare zero or more groups and supported languages.
- Cards include a stable ID and a created-at timestamp.

### Epic 2: Card authoring CLI
As a creator, I can add a new card with a single command so I do not edit code directly.
Acceptance:
- CLI can list cards by category/type/language/group.
- CLI can add a card in one language or multiple.
- CLI can update or remove a card by ID.
- CLI writes data in a stable, human-readable format.
- CLI supports appending groups and languages over time.

### Epic 3: Internationalization
As a player, I can view the app in Spanish or English so the experience is accessible.
Acceptance:
- UI strings are localized.
- Card content supports per-language availability.
- Groups can be localized but remain stable for data queries.
- Cards can be filtered by language availability.

### Epic 4: UI layout and visual identity
As a player, I can select any category from a four-quadrant layout so the entry point is clear and playful.
Acceptance:
- The viewport is divided into four colored regions.
- Each region is clickable and maps to a category.
- Colors: blue, red, green, yellow.
- Design is responsive for mobile and desktop.

### Epic 5: Card draw and animation
As a player, I can trigger an animated shuffle and draw so the reveal feels dynamic.
Acceptance:
- Shuffle animation plays before the reveal.
- Card flip shows front and back.
- Clicking the card toggles the answer.
- All play variants are visually distinct.

### Epic 6: Groups and sets
As a host, I can group cards by tag so I can create themed rounds.
Acceptance:
- Groups can be combined (multi-select).
- Groups can be assigned to cards in multiple categories.
- Group state impacts the random selection.

### Epic 7: Content expansion pipeline
As a contributor, I can add new types or categories without reworking existing data.
Acceptance:
- New card types can be registered with a shared description.
- Categories can contain multiple types.
- Data schema supports future category additions.

## Roadmap (phased)
1. Documentation and data schema definition. (done)
2. Implement card data model and seed dataset from OCR references. (done)
3. Build CLI for listing, grouping, and adding cards. (done)
4. Build UI with i18n and four-quadrant layout. (planned)
5. Add shuffle and flip animations. (planned)
6. Expand groups and add new content sets. (done)

## Open questions
- Should group identifiers be English-only (stable IDs) with localized display strings?
- Should OCR data be stored as a separate import or merged into the data seed?
- What is the minimal card schema to allow partial translations?
