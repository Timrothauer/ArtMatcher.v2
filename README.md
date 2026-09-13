# Art Taste Profiler

Art Taste Profiler is an educational, image-led visual-preference experiment. Phase 0 contains only the static application foundation and hand-written sample data; it does not yet contain the artwork quiz or any model output.

## Run locally

Serve this directory with any simple static HTTP server and open its local URL. Opening `index.html` directly is unsupported because the browser must fetch the local JSON file.

## Phase discipline

1. Read `ProjectGuideline.md`, `TechnicalGuideline.md`, `CONTRACTS.md`, and `CHECKS.md` before editing.
2. Do not change anything under **DO NOT CHANGE WITHOUT ASKING** without stopping for approval.
3. Work additively; do not rename seams, reorganize the structure, or replace working behavior without need.
4. Implement one requested phase only and do not add later-phase features early.
5. Put every new human-tunable value in `config.js`.
6. Put every new data-loading path behind `source.js`; no other module fetches.
7. Put every visible state and DOM mutation behind `ui.js`.
8. Keep secrets out of browser files, commits, logs, and responses; this project should require none.
9. Before committing, run all automated tests and every line of `CHECKS.md`.
10. If something fails, reproduce one symptom, change one thing, and retest instead of redesigning.
11. At a phase end, report files, dependencies, sources, tests, checks, deployment, and unresolved items, then stop.

## Stack and boundaries

- Semantic HTML, plain CSS, and browser JavaScript modules
- Local JSON and, in later phases, local artwork images
- No frontend framework, bundler, runtime AI, API, backend, database, analytics, cookies, or persistent visitor profile
- CLIP will run only during Phase 1 local preparation; the deployed browser will consume saved numeric outputs

The complete product will remain a playful taste snapshot, not a psychological or scientific assessment.
