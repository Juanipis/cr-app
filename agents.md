# Agent Guidelines

This repository builds a static tribute web app inspired by a classic party game format. Follow these rules when contributing.

## Project constraints
- Do not use trademarked category names or brand assets.
- Keep the four category colors: blue, red, green, yellow.
- Keep all data local (no external DB).
- Support i18n for UI and card content; Spanish and English are required.
- Cards may be partially translated; the schema must support per-language availability.
- Store shared activity descriptions once per card type.
- Use Atomic Design structure in the UI.

## Data and content rules
- Card data must be easy to read and extend.
- Cards can belong to multiple group tags (e.g., Colombia, Pop 2024).
- All play variants exist for Blue and Green even without images.
- Avoid non-ASCII unless the content requires it.

## Workflow
- Read `requirements.md` before implementing new features.
- Follow `docs/card-authoring.md` for card data and CLI usage.
- Keep documentation in English.
- Do not remove or alter `card_references/` OCR files unless explicitly asked.
