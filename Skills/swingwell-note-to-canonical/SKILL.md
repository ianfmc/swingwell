---
name: swingwell-note-to-canonical
description: Convert one or more SWINGWELL Apple Notes into canonical Markdown diary entries in the SWINGWELL workspace. Use when the user mentions Apple Notes named like YYYYMMDD - SWINGWELL Diary, asks to convert notes into canonical diary entries, add new practice sessions or rounds, migrate diary notes, or create diary MD files.
---

# SWINGWELL Note to Canonical

## Workflow

1. Work from the SWINGWELL root, usually `/Users/i802235/SWINGWELL`.
2. Extract the Apple Note text with `scripts/extract_apple_note.py "<note title>"` when Notes automation works. If Apple Notes refuses body extraction, use any available plaintext source: copy from the Notes app, an Apple Notes export, or a previous terminal extraction.
3. Create one Markdown file per note at:
   `Diary Entries/YYYY/YYYY-MM/YYYYMMDD - SWINGWELL Golf Diary Entry.md`
4. Use the canonical frontmatter schema from `Templates/SWINGWELL Golf Diary Template.md`.
5. Preserve the source note title in `source_file`, e.g. `Apple Notes/20260624 - SWINGWELL Diary`.
6. Do not invent hard KPI values. Use blanks for unrecorded values.
7. If the note includes screenshots or media:
   - Prefer extracting/saving assets under `Media/YYYY/YYYYMMDD/`.
   - If image extraction is unreliable, still reference the embedded source media in the diary’s Source Media section.
8. After creating the diary entry, run or invoke the dashboard skill if the user asked for dashboard updates.

## Canonical interpretation rules

- Treat simulator/range sessions as `Practice`.
- Treat full rounds as `Round`; half rounds or par-3 rounds may be `Half-Round` or `Practice + Half-Round` when appropriate.
- Use `GREEN`, `YELLOW`, or `RED` only when stated or strongly implied; otherwise leave blank or use the best conservative inference and state it in the content.
- Keep the diary reflective but evidence-based: intention, what showed up, adjustment, trust/loss of trust, observed evidence, and one next-session takeaway.
- Hard Data Snapshot tables should show `N/A` for round metrics during practice sessions.

## Validation

- Confirm the file path exists.
- Confirm frontmatter includes `schema`, `entry_id`, `date`, `title`, `session_type`, `location`, `mental_state`, `source_file`, `assets`, and `kpis`.
- Confirm the entry date, title, and source note title match the requested note.
