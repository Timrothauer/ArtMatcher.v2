# Art Taste Profiler

Art Taste Profiler is an educational, image-led visual-preference experiment. Visitors make eight opening choices and up to six deterministic follow-up choices, then receive a named and explainable taste snapshot, local-catalog recommendations, and an optional three-pair prediction challenge. It is not a psychological assessment or permanent description of the visitor.

## Run locally

Use Node.js 20 or newer for preparation and validation:

```sh
npm install
npm run validate
npm test
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4173`. Opening `index.html` directly is unsupported because the browser fetches local JSON files.

Foundation regression controls are intentionally hidden in the public experience. Add `?diagnostics=1` to the page URL when running the documented foundation checks.

The deployed browser is a static HTML/CSS/JavaScript app. It uses committed local images and saved numeric outputs only; it does not load a model, call a museum API, store visitor choices, or require an API key.

## How the snapshot works

For each directional answer, the browser subtracts the rejected artwork embedding from the chosen artwork embedding. It normalizes the sum into a current preference direction. **Neither / Unsure** is recorded but adds no direction.

After eight fixed comparisons, a deterministic classroom heuristic chooses up to six quiz-only follow-ups. It excludes shown pairs and non-quiz roles, rejects weakly separated images, respects an artwork exposure cap, favors small predicted margins and under-covered evidence, and breaks ties by stable artwork ID. It is an inspectable heuristic, not a claim of mathematical optimality.

The result combines:

- visual similarity from prepared CLIP embeddings;
- paired concept signals compared across chosen and rejected works;
- source metadata for cautious medium, period, and culture/region clues;
- evidence quantity, reconstruction consistency, and visual coverage for **Emerging**, **Moderate**, or **Strong** labels.

Profile names come from the controlled two-attribute mapping in `config.js`, with **The Eclectic Explorer** as the neutral fallback. Recommendations are ranked only among the six reserved recommendation works. The challenge freezes the result vector, records each prediction before display, and uses exactly six held-out works without updating the profile.

## Prepared model outputs

The one-time local generator uses `@huggingface/transformers` 3.8.1 with `Xenova/clip-vit-base-patch32` at pinned revision `d15189d7028b43f1d3e65039190477f6af591c2a` and q8 ONNX weights. It saves normalized 512-dimensional image embeddings and paired concept signals under prompt version `core-concepts-v1`. Model weights remain in the ignored `.cache/` directory and are never deployed.

Run `npm run generate:embeddings` only when a final image or prompt/model configuration intentionally changes. The script hashes each image, reuses current outputs, retries one failed artwork once, and writes atomically.

The catalog uses public-domain or CC0 images and metadata from the Art Institute of Chicago, Cleveland Museum of Art, and The Metropolitan Museum of Art. Full QA, rights, source links, attribution, model details, and limitations are recorded in `data/dataset-report.md`.

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
- Local JSON and local artwork images
- Node preparation scripts using the built-in test runner
- No frontend framework, bundler, runtime AI, API, backend, database, analytics, cookies, local storage, or persistent visitor profile
- No recommendation outside the prepared local catalog and no scientific or sensitive-personal-attribute claim
