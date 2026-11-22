# SWINGWELL implementation and operating workflow

Goal: handicap index 13.0 by June 30, 2027, starting from 19.9. Success is strokes saved. Routine planning should take place in ChatGPT; the dashboard only displays the result.

## Prototype boundary

This feature branch is a working interaction prototype, not a canonical coaching plan. The objective is confirmed. The eight pillar labels are drawn from the supplied conceptual design context, but their arrangement and all priority assignments are illustrative. There are 64 stable commitment slots: 5i Calibration demonstrates the requested interaction; the other 63 await canonical wording. Do not reconstruct these from old coaching documents.

The 5i shot history is a synthetic UI fixture: eight carries, mean 161.1 yd and range 38 yd. It is explicitly labeled illustrative in JSON and the UI. The linked June 23 diary is contextual approach practice involving other clubs, not evidence for the synthetic 5i data. Four complete 40-minute sessions demonstrate the copy workflow; they are not approved prescriptions.

The latest repository index is 19.5, observed June 27, 2026. It is displayed as last recorded, with verification pending. It is not represented as a current verified handicap. The progress bar uses that dated observation and does not predict a trajectory.

## Three views

`Dashboard/index.html` opens Harada by default. Hash navigation switches Harada, Flight Plan and Performance without a page reload. Pillar and commitment details remain within Harada. The full matrix has nine 3×3 blocks; positions are row-major 0–8, with 4 reserved for the central cell. The objective and eight pillars occupy the central block. Outer blocks repeat a pillar in the center and its eight commitments around it.

`Dashboard/diary.html` remains the searchable archive destination from Performance. Existing charts, diary files, media, templates and performance JSON are preserved. Historical guidance is clearly dated, rather than promoted to a current plan.

## Three data files

| File | Update when | Contents |
| --- | --- | --- |
| `Dashboard/data/harada.json` | Monthly Matrix Update — Align; only if evidence warrants a change | Objective, matrix version, updated date, pillars and commitments with stable IDs, positions, priorities and status |
| `Dashboard/data/commitment-evidence.json` | Meaningful new evidence is recorded | Matrix version; commitment-keyed facts, metrics, objectives, hypotheses, actions, dates, shots and references |
| `Dashboard/data/weekly-plan.json` | Sunday Plan — Prepare | Week start/end, timezone, matrix version and exactly four complete practice sessions |

Keep IDs stable when editing wording. If the meaning of a commitment changes, assign a new ID; do not attach the old commitment's evidence to a different concept. On a matrix version change, explicitly review and align evidence and plan versions. Git history preserves prior versions.

Priorities are `active`, `development` or `maintenance`. The prototype's rotating priority colors demonstrate the interface, not a strategic decision. Change top-level `status` from `illustrative` only after confirming that file's contents. Replace each commitment's `unconfirmed` or `illustrative` status with `confirmed` after approval. The header's prototype label is data-driven.

Evidence fields are optional. Use `facts` as dated objects with `text` and `date`; `hypotheses` as separate dated objects; `metrics` as `{label, value, unit, date}`; `shots` as `{status, unit, carry: [numbers]}`; `performance_objectives` as text strings; `next_action` as text; and `references` as `{label, path}`. Link source diaries using paths relative to Dashboard, e.g. `../Diary Entries/...`. Reuse the existing performance JSON for aggregate history; avoid copying those series into commitment evidence. Carry range is max minus min, not lateral dispersion or standard deviation. Empty evidence displays an honest empty state.

Each weekly session contains `id`, `title`, `duration_minutes`, `purpose`, `commitment_ids`, `blocks` (`title`, `minutes`, `instructions`), `success_criteria`, and optional `process_commitment` and `stop_rule`. Block minutes must total the session duration. Four sessions are required. Invalid references or a mismatched matrix version prevent an apparently valid plan from displaying.

## Operating ceremonies

These ceremonies are the operating model, not application features. ChatGPT reasons and prepares the outputs; GitHub stores the evidence, plans and decisions. Keep exactly three application views: Harada, Flight Plan and Performance. No scheduler, reminders, extra tracking system or automation framework is introduced.

| Ceremony | Inputs and decisions | Persisted outputs |
| --- | --- | --- |
| **Saturday Review — Learn** | Previous week's practice diaries, rounds, performance observations and active Harada commitments. Identify what improved, what remains inconsistent, and what matters most next. Separate measured facts from hypotheses and preserve uncertainty. | A dated weekly review; warranted updates to `commitment-evidence.json`; recommended priorities for the following week. |
| **Sunday Plan — Prepare** | Saturday's review, recommended priorities, current commitments and available practice time. Construct four practice sessions with purpose, instructions, timed blocks and measurable success criteria. | Updated `weekly-plan.json`, four complete Apple Notes-ready sessions, and the coming week's published Flight Plan once publishing is approved. |
| **Monthly Matrix Update — Align** | Progress toward 13.0 by June 30, 2027 and evidence across all eight pillars. Assess whether commitments, priorities and performance objectives still fit. | A brief strategic decision record; a new matrix version only if commitments, priorities or strategic objectives change; corresponding evidence/objective updates where warranted. Record a no-change decision without inventing a new matrix version. |

Saturday reviews evidence; Sunday plans execution; the monthly ceremony reviews strategy. Weekly findings can recommend a strategic change, but do not silently rewrite the canonical matrix. An ordinary weekly plan references existing commitments without altering their strategic definitions or matrix priorities.

### Persistence with existing folders

Add review records to the existing `Monthly Summaries/` folder as they actually occur:

- `YYYY-MM-DD - SWINGWELL Weekly Review.md` for Saturday's review.
- `YYYY-MM-DD - SWINGWELL Matrix Review.md` for the monthly strategic decision record.

This is additive; older monthly compilations stay untouched. Do not create backdated reviews merely to populate a link. A weekly record needs only: period reviewed, source diary links, active commitments, what improved, what remains inconsistent, evidence changes, recommended next-week priorities and open questions. A monthly record needs: objective progress, a brief assessment of all eight pillars, decision and supporting evidence, any priority/objective changes, and old/new matrix versions (or “unchanged”). Git commits preserve the versions and rationale.

### Minimal provenance in JSON

- `weekly-plan.json`: `prepared_on` dates the Sunday preparation; optional `review_ref` links to its Saturday review. Week dates identify execution, not the review date. In the UI a supplied review link appears within Flight Plan.
- `commitment-evidence.json`: optional `review_ref` identifies the review associated with an evidence update. Individual observations retain their actual observation dates and diary references; review date does not replace observation date.
- `harada.json`: `review_cadence` identifies the monthly strategic review; optional `review_ref` points to the latest strategic decision record. Keep stable IDs and increment `version` for substantive matrix changes. A no-change review can update the review metadata without changing matrix version.
- Review paths are relative to Dashboard, e.g. `../Monthly Summaries/YYYY-MM-DD - SWINGWELL Weekly Review.md`. Null means no record has been supplied. The prototype contains no fabricated review records.

### Low-effort maintenance

1. Saturday: ask ChatGPT to review the week's existing evidence and prepare the dated review, evidence updates and recommendations together.
2. Sunday: use that review to prepare four sessions. Routine plan updates change only `weekly-plan.json`; complete Apple Notes text is rendered from it automatically.
3. Monthly: review the matrix and record the decision. Change strategy only when evidence justifies it; reconcile the evidence and plan version references when it changes.
4. Check dates, commitment links and timings; commit the small set of changed data/review files to GitHub. After initial publication is approved and Pages configured, use the approved publishing path to make Sunday's Flight Plan available. Until then, review it on the feature branch; do not merge or publish without approval.

There is no completion checklist or browser storage. Completed work remains in the existing Markdown diaries. Plans show upcoming, current or past status using the configured timezone (`America/Los_Angeles`). The page does not automatically generate a new plan.

Copy to Clipboard writes all session instructions as plain text: dates, duration, purpose, linked commitments, every block, success criteria, process commitment, stop rule and diary reminder. On denied or unavailable clipboard access, a labeled read-only text area exposes and selects the complete text for manual copying. No Apple Notes account connection is required.

## Validation and review

- Check desktop and phone widths, all 81 cells, pillar/commitment selection and keyboard Enter/Tab operation.
- Check every session's clipboard text against its full practice instructions, plus the fallback with clipboard permission denied.
- Check an expired plan and invalid commitment reference; neither should silently display as a valid current plan.
- Check both existing SVG charts, the diary search and a diary link.
- Confirm canonical matrix, evidence and first approved week before deployment.

## Deferred discrepancies

No historical data cleanup was performed. Known items for targeted review if they affect a selected current indicator:

- June 27 appears in performance/index history but not `round-metrics.json`.
- Practice/round totals drift from diary metadata. April 25 has two descriptions of the same session; duplicate detection checks the title, which omits the filename's duplicate marker. Some session types are blank or combined.
- Older diary KPI frontmatter is often empty despite narrative statistics.
- The former overview's June 21 latest-round label is now explicitly a historical 18-hole snapshot. Static session cards, split tables and archived priorities remain historical; routine flight-plan edits do not touch them.
- Identical extracted CSV datasets exist across workbook versions; some exports retain spreadsheet formulas.
- Older yardages and the December 2026 target remain historical records. The active objective comes from `harada.json`.
- Originals mentioned in the migration report and July–November records are absent from the inspected GitHub branch; local-only completeness is unverified.
- Existing combined-chart points snap to index checkpoints. This behavior is preserved, with its existing explanatory label.

## Publishing boundary

GitHub Pages is the intended host. No Pages settings, workflow, public site or merge is created by this prototype. After explicit review and publishing approval, configure a deployment that preserves the repository-relative layout: serve the repository with the application at `Dashboard/index.html` (or an equivalent staged artifact preserving `Dashboard/`, `Diary Entries/` and `Media/`). Do not publish only the contents of Dashboard: its existing `../Diary Entries/...` links need the sibling directories. Review the deployment file selection and visibility first. Existing S3 publishing is not invoked.

## Prototype verification — November 22, 2026

Passed Chrome desktop and 390/320 CSS-pixel phone-width checks: exactly three top-level views, 81 accessible matrix cells, keyboard commitment activation, illustrative 5i metrics/chart, empty evidence state, four full clipboard copies (1,153–1,278 characters), denied-clipboard selectable-text fallback, expired-plan notice, rejection of an invalid commitment link, both preserved historical SVG charts and diary search (51 records; date filtering works). Data checks passed for unique IDs, matrix positions, version links, four sessions and timing totals. Existing historical files and performance JSON are unchanged. Phone-width checks use responsive viewports, not physical iPhone/Safari or a live Apple Notes app; actual Notes paste remains a user acceptance check. No deployment performed.
