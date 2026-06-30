---
name: swingwell-update-dashboard
description: Refresh the SWINGWELL static dashboard from canonical diary entries and data files. Use when the user asks to update, refresh, rebuild, or show the dashboard after new diary entries, practice sessions, rounds, handicap index changes, front/back splits, KPI corrections, or chart/table changes.
---

# SWINGWELL Update Dashboard

## Workflow

1. Work from `/Users/i802235/SWINGWELL`.
2. Refresh derived diary data with:
   `python3 Skills/swingwell-update-dashboard/scripts/refresh_diary_index.py`
3. Update dashboard source files as needed:
   - `Dashboard/index.html`
   - `Dashboard/assets/swingwell.css`
   - `Dashboard/data/*.json`
4. Preserve existing dashboard design language unless the user asks for a redesign.
5. Use `apply_patch` for dashboard edits.
6. Verify JSON files with `python3 -m json.tool`.
7. If the user has the in-app browser open or asks to show the dashboard, use the in-app browser skill and reload `http://127.0.0.1:8765/`.

## Dashboard conventions

- Static dashboard root: `Dashboard/`.
- Dashboard data lives under `Dashboard/data/`.
- Diary archive list is `Dashboard/data/diary-index.json`.
- Practice/round ratio is `Dashboard/data/practice-round-metrics.json`.
- Current index is kept in `Dashboard/data/index-history.json`.
- Round performance series is `Dashboard/data/performance-history.json`.
- Latest cards in `Dashboard/index.html` are manually curated; update them when new sessions materially change the story.
- Keep chart cache-buster query strings current when changing JSON consumed by the page.

## Counting rules

- Count `Practice`, `Lesson`, and practice-combo sessions as practice unless clearly excluded.
- Count full 18-hole rounds and recorded 9-hole rounds as rounds when they are present in the diary index / round metrics.
- Keep `excluded_count` for known drafts, duplicates, or non-session items.
- Display practice ratio as practices per round with one decimal.

## Validation

- Verify the new diary entries appear in `Dashboard/data/diary-index.json`.
- Verify `Dashboard/data/practice-round-metrics.json` parses and the ratio is correct.
- Reload the local dashboard and inspect the relevant card/table/chart in the browser.
