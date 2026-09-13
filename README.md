# Art Taste Profiler

Art Taste Profiler is an educational, image-led visual-preference experiment. Phase 1 provides a fixed eight-comparison loop over a prepared local museum collection, then turns selected-minus-rejected CLIP embeddings into a cautious first taste snapshot. It is not a psychological assessment or permanent description of the visitor.

## Run locally

Use Node.js 20 or newer for preparation and validation:

```sh
npm install
npm run validate
npm test
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4173`. Opening `index.html` directly is unsupported because the browser fetches local JSON files.

The deployed browser is a static HTML/CSS/JavaScript app. It uses committed local images and saved numeric outputs only; it does not load a model, call a museum API, store visitor choices, or require an API key.

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
- Adaptive comparisons, recommendations, profile challenge, and named profiles remain Phase 2 work and are not implemented in Phase 1
