# AI Card Generation Prompt (EN)

Use this prompt when asking an AI to generate new cards for this project. The output must be original, creative, and legally safe.

## Prompt
You are generating NEW, ORIGINAL challenge cards for a tribute party game. Be creative and culturally current. Do NOT use trademarked names, official game names, or brand assets. Avoid copyrighted text. Use neutral, descriptive wording.

Each card has:
- **Front**: prompt blocks (labels + text/list).
- **Back**: answer.
- **Metadata**: id, typeId, groups, languages, createdAt.

### Requirements
1) **Creativity & variety**: produce a mix of easy, medium, and hard cards. Include witty, smart, and culturally relevant prompts. Avoid trivial or boring tasks.
2) **Cultural relevance**: use modern references (music, social media trends, games, tech, sports, Colombian culture, Latin America). If possible, check the internet for up-to-date ideas and then rephrase in original words.
3) **Bilingual output**: always provide **Spanish and English** content for each card. If you can only do one language, state clearly which is missing.
4) **No trademarks**: do not use official game names or trademarked category/type names. Use our custom type IDs only.
5) **Type instructions live in types**: do NOT repeat the activity description on each card. Only include the prompt blocks and the answer.
6) **Difficulty tags**: include a `groups` tag of `easy`, `medium`, or `hard` for each card.
7) **Varied formats**: use labels like `PREGUNTA`, `PISTA`, `OPCIONES`, `ANAGRAMA`, `TEMA` depending on the type.
8) **IDs**: must be unique and follow `type_slug_###` pattern. Use the next available ID.

### Allowed type IDs (current)
- Blue: `blue_dibu_ciego`, `blue_molde_mudo`, `blue_pinta_silencio`, `blue_todos_juegan`
- Red: `red_elige_una`, `red_sobran_dos`, `red_pregunta_directa`, `red_verdadero_no`
- Green: `green_mimo_total`, `green_imita_voz`, `green_tararea`, `green_titiril`, `green_todos_juegan`
- Yellow: `yellow_faltan_letras`, `yellow_defini_duelo`, `yellow_anagrama`, `yellow_piensa_junto`, `yellow_al_reves`

### Output format
Return a JSON array of cards that can be saved and imported as-is. Example:

```json
[
  {
    "id": "blue_dibu_ciego_011",
    "typeId": "blue_dibu_ciego",
    "groups": ["colombia", "cultura-pop", "easy"],
    "languages": ["es", "en"],
    "createdAt": "2025-01-20",
    "content": {
      "es": {
        "blocks": [
          { "label": "PISTA", "text": "LUGAR" }
        ],
        "answer": "Ciclovia dominical"
      },
      "en": {
        "blocks": [
          { "label": "CLUE", "text": "PLACE" }
        ],
        "answer": "Sunday bike lanes"
      }
    }
  }
]
```

### Quality checklist (must pass)
- Are the prompts fun and clever, not trivial?
- Are there easy, medium, and hard cards?
- Is each card culturally current?
- Are Spanish and English both present?
- Are all names and wordings original?
