# SWINGWELL implementation and operating workflow

Goal: handicap index 13.0 by June 30, 2027, starting from 19.9. Success is strokes saved. Routine planning should take place in ChatGPT; the dashboard only displays the result.

## Approved strategy and provisional execution

The supplied Harada v1.0 handoff is authoritative: `Dashboard/data/harada.json` and `Plan/SWINGWELL-Harada-v1.0.md` are preserved byte-for-byte. All eight pillars, 64 commitment IDs and exact commitment wording are retained. The UI maps the supplied array order to row-major positions 0–8, excluding center 4; it does not alter canonical data. Optional explicit `position` values can override presentation order in a future approved version.

The latest verified handicap is 17.9 on November 1, 2026, sourced to the user-supplied GHIN screenshot as recorded in the approved handoff. Harada progress is 2.0 of the required 6.9 index points (29%). Performance displays the same verified observation separately from the unchanged historical charts and 19.5 June 27 observation. No membership number or screenshot is added.

`weekly-plan.json` is also preserved byte-for-byte from the handoff: November 23–29, four sessions of 55, 50, 55 and 50 minutes. Its status remains `proposed_pending_sunday_review`; the view and every copied session say provisional. This is not evidence that either review ceremony has occurred. Four sessions are a flexible planning baseline; a round can replace a session.

No commitment priorities or commitment-specific measured evidence were supplied. Priorities display “Not assigned”; active/development/maintenance styles are supported without inventing classifications. Synthetic prototype measurements and hypotheses have been removed. Commitments without supplied evidence display “Baseline needed,” the approved pillar guidance, and linked provisional practice actions when available. Benchmarks remain goals rather than measured results.

## Three views

`Dashboard/index.html` opens Harada by default. Hash navigation switches Harada, Flight Plan and Performance without a page reload. Pillar and commitment details remain within Harada. The full matrix has nine 3×3 blocks; positions are row-major 0–8, with 4 reserved for the central cell. The objective and eight pillars occupy the central block. Outer blocks repeat a pillar in the center and its eight commitments around it.

`Dashboard/diary.html` remains the searchable archive destination from Performance. Existing charts, diary files, media, templates and performance JSON are preserved. Historical guidance is clearly dated, rather than promoted to a current plan.

## Three data files

| File | Update when | Contents |
| --- | --- | --- |
| `Dashboard/data/harada.json` | Monthly Matrix Update — Align; only if evidence warrants a change | Approved objective and verification, matrix_version, approved_on, pillars, outcomes, performance_guidance, exact commitments and IDs; optional positions/priorities |
| `Dashboard/data/commitment-evidence.json` | Meaningful new evidence is recorded | Matrix version; commitment-keyed facts, metrics, objectives, hypotheses, actions, dates, shots and references |
| `Dashboard/data/weekly-plan.json` | Sunday Plan — Prepare | Week start/end, provisional or confirmed status, note, matrix version and four complete sessions; optional timezone (defaults to America/Los_Angeles) |

Keep IDs stable when editing wording. If the meaning of a commitment changes, assign a new ID; do not attach the old commitment's evidence to a different concept. On a matrix version change, explicitly review and align evidence and plan versions. Git history preserves prior versions.

Optional commitment `priority` values are `active`, `development` or `maintenance`; absence means unassigned, not poor performance. Assign priorities only through a confirmed strategic decision. Approved matrix fields use `matrix_version`, `approved_on`, pillar `name`, commitment `text` and stable `id`; the renderer adapts these fields without rewriting their source. Keep the human-readable companion aligned when approved strategy changes.

Evidence fields are optional. Use `facts` as dated objects with `text` and `date`; `hypotheses` as separate dated objects; `metrics` as `{label, value, unit, date}`; `shots` as `{status, unit, carry: [numbers]}`; `performance_objectives` as text strings; `next_action` as text; and `references` as `{label, path}`. Link source diaries using paths relative to Dashboard, e.g. `../Diary Entries/...`. Reuse the existing performance JSON for aggregate history; avoid copying those series into commitment evidence. Carry range is max minus min, not lateral dispersion or standard deviation. Empty evidence displays an honest empty state.

Each weekly session contains `id`, `title`, `duration_minutes`, `purpose`, `commitment_ids`, `blocks` (`name`, `minutes`, `instructions`), `success_criteria`, and optional `process_commitment` and `stop_rule`. Block minutes must total the session duration. Four sessions are required. Invalid references or a mismatched matrix version prevent an apparently valid plan from displaying.

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
- `harada.json`: `review_cadence` identifies the monthly strategic review; optional `review_ref` points to the latest strategic decision record. Keep stable IDs and increment `matrix_version` for substantive matrix changes. A no-change review can update the review metadata without changing matrix version.
- Review paths are relative to Dashboard, e.g. `../Monthly Summaries/YYYY-MM-DD - SWINGWELL Weekly Review.md`. Null means no record has been supplied. No fabricated review records have been added.

### Low-effort maintenance

1. Saturday: ask ChatGPT to review the week's existing evidence and prepare the dated review, evidence updates and recommendations together.
2. Sunday: use that review to prepare four sessions. Keep `status` as `proposed_pending_sunday_review` until Ian confirms the plan; then set it to `confirmed` and optionally record `confirmed_on`. Routine plan updates change only `weekly-plan.json`; complete Apple Notes text is rendered from it automatically.
3. Monthly: review the matrix and record the decision. Change strategy only when evidence justifies it; reconcile the evidence and plan version references when it changes.
4. Check dates, commitment links and timings; commit the small set of changed data/review files to GitHub. After initial publication is approved and Pages configured, use the approved publishing path to make Sunday's Flight Plan available. Until then, review it on the feature branch; do not merge or publish without approval.

There is no completion checklist or browser storage. Completed work remains in the existing Markdown diaries. Plans show upcoming, current or past status using the configured timezone (`America/Los_Angeles`). The page does not automatically generate a new plan.

Copy to Clipboard writes all session instructions as plain text: provisional/confirmed status, expired-plan warning when applicable, plan note, dates, duration, purpose, linked commitment IDs and exact text, every block, success criteria, process commitment, stop rule and diary reminder. On denied or unavailable clipboard access, a labeled read-only text area exposes and selects the complete text for manual copying. No Apple Notes account connection is required.

## Validation and review

- Check desktop and phone widths, all 81 cells, pillar/commitment selection and keyboard Enter/Tab operation.
- Check every session's clipboard text against its full practice instructions, plus the fallback with clipboard permission denied.
- Check an expired plan and invalid commitment reference; neither should silently display as a valid current plan.
- Check both existing SVG charts, the diary search and a diary link.
- Confirm the provisional week, any desired priority assignments, and publication visibility before deployment. The canonical matrix is already approved; unavailable evidence stays empty.

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

GitHub Pages is the intended host. No Pages settings, workflow, public site or merge is created by this implementation. After explicit review and publishing approval, configure a deployment that preserves the repository-relative layout: serve the repository with the application at `Dashboard/index.html` (or an equivalent staged artifact preserving `Dashboard/`, `Diary Entries/` and `Media/`). Do not publish only the contents of Dashboard: its existing `../Diary Entries/...` links need the sibling directories. Review the deployment file selection and visibility first. Existing S3 publishing is not invoked.

## Validation — approved v1.0

Check the approved JSON and Markdown against the supplied handoff byte-for-byte; verify 64 unique commitment IDs, eight pillars with eight commitments each, all session references and timing totals. Check all 81 rendered cells and exact commitment wording, the verified handicap date and 29% progress, provisional status in the view and all four complete clipboard outputs, denied-clipboard manual selection, expired plans, missing evidence, keyboard navigation, phone widths, historical charts and searchable diary access.

Browser checks use Chrome at phone CSS widths, not a physical iPhone/Safari or the Apple Notes app. Actual device paste remains a user acceptance check. GitHub Pages is intended but has not been configured or published; merge and publication require approval.

### Verified November 22, 2026

Passed source byte comparisons, 8×8 unique IDs, session links and timing totals, JavaScript syntax and whitespace checks. Browser validation passed three-view navigation, 81 cells, keyboard commitment activation, verified 17.9 / November 1 / 29% display, empty and unavailable evidence handling, four complete plain-text clipboard copies (2,041 / 2,035 / 2,129 / 2,447 characters), provisional labels, denied-clipboard selection fallback, expired-plan display and copied warning, and invalid commitment-link rejection. No application console errors were observed; the browser extension emitted unrelated metadata errors.

Responsive checks passed 390px and 320px iframe widths (375px and 305px content widths with the browser scrollbar), including expanded matrix containment and keyboard access to the last commitment. Both historical SVG charts rendered; the archive displayed 51 records and filtered by date. All 51 archive file targets exist locally. The cloud browser blocked the Markdown download action, so an actual diary download was not verified there. Physical iPhone/Safari and Apple Notes paste remain user acceptance checks.

Visibility review: the existing GitHub repository is public. This change adds approved strategy, the provisional plan and the human-readable matrix; it adds no GHIN membership number, screenshot or new historical diary. Public Pages publication and its file selection still require Ian's approval. The current branch is for review; no merge or deployment is authorized by this validation.

## First evidence integration — November 22, 2026

The completed November 22 diary is saved under `Diary Entries/2026/2026-11/` using its supplied filename. Its Markdown body is unchanged from the available source copy. Small frontmatter fields support the existing archive generator: date, title, Practice, Full Swing, and the last reported mental state YELLOW (with the GREEN-to-YELLOW sequence explicitly noted). This records practice, not an outdoor round. The existing archive index gains one entry; historical performance series and the unresolved practice/round ratio remain untouched.

Three shared `observations` in `commitment-evidence.json` hold the dated 6i, 4H and 3W Full Swing baselines. Commitment entries use `observation_ids` to reference those observations without duplicating the measurements. Each observation includes source, sample limitations, simulator-reported averages and a readable carry subset. The renderer shows the subset separately; it never uses the seven readable shots to replace a simulator average. The estimated eighth 6i shot remains in the diary as a reconstruction, excluded from measured-shot charts. Exact lateral deviations and unconfirmed sample sizes remain missing. Repeated 188.0 entries visible in the 3W shot history are retained; the separate selected-shot screen is not counted again.

The `latest_session` summary in that evidence file links Performance to the diary and relevant commitments. Completed-session facts, self-reported mental observations, coaching hypotheses and proposed next actions are distinguished. Other commitments retain their empty state. The canonical matrix and next week's provisional plan are unchanged; no ceremony completion is implied. Routine evidence/plan updates need structured data changes only, not HTML edits.

The available source was the same-named diary created in the practice conversation. The supplied Mac path could not be accessed, so equality with any subsequent local edits is unverified. No raw screenshots or GHIN identifiers were added.

Integration validation passed: diary body matches the available source exactly; all 15 commitment IDs and shared observation references resolve; all 21 readable carries and simulator means agree with the diary; all diary links target existing files; the previous 51 archive entries remain unchanged. The archive generator reads the added frontmatter without changes. Browser checks passed the 6i/4H/3W evidence tables, partial-shot charts, self-reported Mental Game evidence, keyboard links from Performance, both historical charts, 390/320px phone wrappers without page overflow, and the 52-entry archive with November 22 search. Canonical matrix, provisional weekly plan and historical performance JSON remain byte-for-byte unchanged from the previous branch commit. Apple Notes copy logic was not changed and retains the earlier validation.
