# Art Taste Profiler — Technical Guideline

**Audience:** Codex and the student builder  
**Purpose:** Define the architecture, invariants, permissions, validation, and phase discipline that keep the project understandable and buildable.  
**Product authority:** `ProjectGuideline.md`

## 1. Operating contract

Before changing the project, Codex must read `ProjectGuideline.md`, this entire file, `CONTRACTS.md`, and `CHECKS.md`. User instructions determine the requested work; these guides constrain implementation. `ProjectGuideline.md` controls product behavior and scope, while this file controls technical structure and build discipline.

At the beginning of a new phase, Codex must report in five lines or fewer:

- the project and requested phase;
- the smallest expected file changes;
- any dependency it expects to add;
- whether the request conflicts with an invariant or excluded technology;
- the previous behavior that must remain working.

If the work would change anything under **DO NOT CHANGE WITHOUT ASKING** in `CONTRACTS.md`, Codex must stop and ask first. Otherwise, implement only the requested phase.

When starting Phase 0 in a new project folder, this first report must specifically name **Art Taste Profiler**, identify category **3 — AI interpretation**, list the foundation files about to be created, and disclose any contradiction found in these guidelines or the existing folder. Codex must then wait for the student to say **continue** before creating Phase 0 files. Later phases use the normal guard report and may proceed unless a contract, scope, permission, or stop-gate issue requires approval.

## 2. Fixed stack

The technical priorities, in order, are: a small understandable stack; reproducible preparation; no manual student data gathering; stable seams between phases; observable acceptance gates; transparent math; honest uncertainty; and public verification after every checkpoint.

Use:

- semantic HTML;
- plain CSS with custom properties;
- plain browser JavaScript using ES modules;
- local JSON files and local artwork images;
- Node.js scripts for preparation and validation only;
- `@huggingface/transformers` for preparation-time CLIP processing only;
- a documented public CLIP ViT-B/32-compatible checkpoint;
- Node’s built-in test runner;
- Git and GitHub;
- Vercel Hobby static hosting.

Do not install a frontend framework, CSS framework, bundler, linter, UI library, state library, vector-math package, production backend, or database. Add an image-processing dependency only if official source resizing cannot produce suitable assets, and explain the need first.

Prefer Node’s built-in `fetch`, Node’s built-in test runner, browser-native DOM APIs, plain CSS, and official IIIF or source image resizing. Do not install a package for trivial vector arithmetic.

Pin dependency versions in the lockfile. Record the exact CLIP checkpoint identifier and revision when practical.

### Phase-to-stack map

| Phase | Additions | Prohibited at this point |
|---|---|---|
| Phase 0 | HTML, CSS, browser modules, hand-written sample JSON, contracts, checks, GitHub/Vercel smoke test | Packages, real artwork data, models, scripts, APIs, backends |
| Phase 1 | Prepared local images and metadata, Node preparation scripts, Transformers.js, saved embeddings and concept scores, fixed quiz, built-in tests | Adaptive flow, challenge, runtime AI, external production requests |
| Phase 2 | Adaptive heuristic, confidence, profile naming, recommendations, challenge, accessibility and visual polish | New external services, persistence, expanded catalog, later-project features |

No phase requires a new third-party account or a production environment variable.

## 3. Phase 0 foundation

Phase 0 is a scaffold and deployment task, not a product-feature task. Install nothing and use no real artwork data, model, API, key, backend, or scraping.

Create this structure:

```text
/
  index.html
  style.css
  app.js
  ui.js
  source.js
  config.js
  CONTRACTS.md
  CHECKS.md
  README.md
  .gitignore
  /data
    sample.json
```

Create `.gitignore` first. It must include:

```text
.env
.env.local
.env.*
node_modules/
.DS_Store
.cache/
models/
tmp/
coverage/
```

Phase 1 may add:

```text
/assets/artworks/
/data/artworks.json
/data/embeddings.json
/data/initial-pairs.json
/data/dataset-report.md
/scripts/generate-embeddings.mjs
/scripts/validate-dataset.mjs
/tests/inference.test.mjs
package.json
package-lock.json
```

Additional small ES modules may be added when responsibilities become clear, but the permanent seams below must remain intact.

## 4. Permanent application seams

### `index.html`

Contains markup only. It provides a header, controls region, status line, and results/view region with stable IDs recorded in `CONTRACTS.md`. Do not place inline styles or application logic in HTML.

### `style.css`

Contains all styling. Define color, type, spacing, radius, and layout tokens as custom properties in `:root`. Include visible disabled and focus states, an error variant, responsive image behavior, one or more minimal mobile breakpoints, and `prefers-reduced-motion` handling. Keep the Phase 0 stylesheet near 120 lines and use no animation in that phase. Later motion must be subtle and clarify state. Do not add an animation library.

### `app.js`

Coordinates events and application state only. It may read user actions and call `source`, inference modules, and `ui`; it must never call `fetch` directly or write to the DOM using `innerHTML`, `textContent`, `classList`, or ad hoc selectors.

### `ui.js`

Owns every visible state and all DOM mutation. From Phase 0, export these exact functions:

```js
setBusy(isBusy)
setStatus(message)
showError(message)
showEmpty(message)
renderList(items)
clearResults()
```

Every function must be visibly exercised during Phase 0. Later phases may add clearly named render functions for welcome, comparisons, results, recommendations, and challenge views, but may not bypass `ui.js`.

Errors shown to visitors must be readable sentences, never stack traces or raw responses.

### `source.js`

Is the only place data enters the application. Export an object named `source` with these permanent async methods:

```js
source.load(params)
source.detail(id)
source.save(record)
source.list()
```

In Phase 0, `load` and `detail` read `data/sample.json`. Because this project intentionally has no persistence, `save` and `list` must throw a clear `Not used in this project` error rather than using local storage. In later phases, local catalog and embedding loading stays inside these methods or small helpers called only by this module.

Wire the Phase 0 primary control so `app.js` calls `source.load()`, passes its plain result to `ui.renderList()`, and surrounds the operation with `setBusy`, `setStatus`, `showEmpty`, and `showError`. This makes every permanent seam observable before product features exist.

### `config.js`

Exports one frozen configuration object. Every human-tunable value belongs here, including:

- local data paths;
- initial and adaptive comparison counts;
- minimum adaptive answers before **Finish Now**;
- artwork exposure cap;
- adaptive heuristic weights and distance thresholds;
- confidence thresholds;
- result and recommendation limits;
- feature flags;
- concept labels and prompt-version identifiers.

No magic number or URL may appear elsewhere when it is reasonably configurable.

## 5. `CONTRACTS.md`

Create this file in Phase 0 and obey it thereafter. It must record:

- every stable DOM ID;
- the six permanent `ui.js` exports;
- the four permanent `source.js` methods;
- the normalized shape of all records returned by `source`;
- the artwork, embedding, pair, answer, and application-state shapes once introduced;
- the rule that keys are never omitted and missing values use the documented `""`, `null`, or `[]` representation;
- a heading named **DO NOT CHANGE WITHOUT ASKING** listing all stable names and shapes.

The normalized artwork contract must support:

```js
{
  id: "aic-27992",
  sourceId: "27992",
  source: "Art Institute of Chicago",
  sourceUrl: "https://www.artic.edu/artworks/27992",
  title: "A Sunday on La Grande Jatte",
  artist: "Georges Seurat",
  yearLabel: "1884-1886",
  yearStart: 1884,
  yearEnd: 1886,
  medium: "Oil on canvas",
  cultureOrRegion: "France",
  department: "Painting and Sculpture of Europe",
  originalImageUrl: "https://institution.example/image.jpg",
  imagePath: "assets/artworks/aic-27992.jpg",
  imageAlt: "A concise factual description",
  rightsStatement: "Public Domain",
  quizRole: "quiz",
  conceptScores: {
    abstract: 0.12,
    figurative: 0.81,
    minimal: 0.18,
    visuallyDense: 0.74
  }
}
```

`quizRole` is exactly `quiz`, `recommendation`, or `holdout`. High-dimensional embeddings remain in a separate file and join by stable artwork ID.

## 6. `CHECKS.md`

Maintain a numbered regression list that can initially be run by hand in under three minutes. Phase 0 must include:

1. The page loads with no console errors.
2. The main action produces a visible result.
3. The empty state appears when there is nothing to show.
4. The error state shows a readable sentence.
5. The busy state appears and clears correctly.
6. The layout is usable at 375px wide.
7. Keyboard focus and activation work.
8. No secret appears in any Git-tracked file.
9. The public Vercel URL loads the same working version.

Append relevant checks after every phase; never remove a passing check merely to make a regression disappear. Before every checkpoint, run the complete file and report each item as pass or fail.

## 7. Production and preparation boundary

The deployed browser may:

- load local JSON and images;
- hold choices in memory for the current page session;
- add, subtract, and normalize vectors;
- calculate dot products and cosine similarity;
- choose adaptive pairs with fixed logic;
- calculate evidence and confidence;
- select a controlled profile name;
- rank local recommendation works;
- run the held-out challenge;
- reset in-memory state.

The deployed browser must not:

- download or run CLIP;
- create embeddings;
- perform image recognition, detection, or classification;
- call an AI or museum service;
- fetch user-provided URLs;
- collect personal information;
- persist or transmit taste profiles.

Local preparation scripts may validate local catalog files, run the public checkpoint, generate embeddings and concept scores, and write final project data. They must not train a model, create museum-specific source adapters, bulk-fetch museum catalogs, invent missing facts, or require the student to create another account.

## 8. Catalog and asset rules

Codex supplies exactly 36 final records and images: 24 quiz, 6 recommendation, and 6 holdout. For each final image:

- use a web-appropriate local copy, ideally 800–1200 pixels on the long edge;
- preserve aspect ratio and do not enlarge tiny originals;
- use a stable filesystem-safe filename derived from the artwork ID;
- retain source page, original image URL, and available rights or credit text;
- provide museum-authored alternative text when available or a concise factual fallback;
- verify that the saved image exists and decodes.

Prefer open-access works where practical because a Vercel deployment is public. Never remove watermarks, bypass access controls, use login-only sources, or treat search-engine thumbnails as canonical sources.

Do not hotlink final production images. When an official source requests local download rather than embedding, follow that requirement. Use institutional image resizing or IIIF where appropriate to obtain a suitable local display copy.

Codex must inspect a contact sheet or equivalent visual overview and correct poor crops, unclear images, redundancy, overrepresented styles, and sampling confounds before finalizing the set.

### Required sampling coverage

Assess the final catalog across:

- abstract and figurative work;
- restrained and saturated color;
- minimal and visually dense compositions;
- geometric and organic structure;
- calm and energetic or dramatic mood;
- human subjects, landscape, objects, and nonrepresentational work;
- painting, photography, sculpture, design, and other forms such as prints, drawings, textiles, or decorative arts;
- historical, modern, postwar, and contemporary periods where source data supports them;
- multiple geographic and cultural contexts.

These are sampling dimensions, not claims that art fits into rigid binary categories.

Avoid a final set where one property always travels with another. Check specifically that:

- abstract work is not always colorful;
- photography is not always contemporary;
- East Asian work is not always historical;
- sculpture is not always monochrome;
- figurative work is not limited to human portraits.

Replace candidates before embedding generation if the set contains obvious confounds.

### Duplicate and metadata review

Use stable `source + sourceId` uniqueness, exact file hashes, and title-plus-artist review. An optional perceptual review is acceptable only if it does not require a heavy new dependency. Required fields are stable source ID, title, source name, source URL, original usable image reference, and corresponding valid local image. Optional metadata may be missing, but the catalog as a whole must support meaningful medium, period, and geographic analysis.

## 9. CLIP preparation pipeline

### One-time preparation sequence

Catalog research and selection are Codex setup responsibilities rather than application features. Codex must:

1. consult reputable official institutional collection pages or public resources;
2. preserve the official source link and available credit or rights information;
3. choose a balanced candidate set using the sampling rules above;
4. download appropriately sized local images;
5. normalize factual fields without inventing missing values;
6. visually inspect candidates and replace defects or redundancies;
7. finish with exactly 36 valid records and images;
8. assign 24 quiz, 6 recommendation, and 6 holdout roles while preserving variety in each group;
9. validate the catalog before running CLIP;
10. generate final embeddings and concept scores;
11. build deterministic initial pairs;
12. run full validation and write the dataset report.

Research notes, rejected candidates, temporary responses, source-page captures, and retrieval tools stay outside the submitted project or in an ignored temporary directory. Do not ask the student to perform any step in this sequence manually.

Use `@huggingface/transformers` only from a local Node preparation script:

```text
local final image
  → one documented CLIP-compatible preprocessing path
  → fixed-length image embedding
  → L2 normalization
  → saved JSON keyed by artwork ID
  → browser consumes saved numbers
```

Requirements:

- use one checkpoint and preprocessing path for all works;
- record package version, checkpoint name, dimension, and prompt version;
- fail on non-finite values or dimension mismatches;
- validate every vector norm within a documented tolerance;
- cache safely to avoid recomputing unchanged images;
- keep model weights and caches out of Git;
- include checkpoint attribution in the README.

Generate and save concept scores during preparation using fixed, neutral prompt pairs. Prompt wording and results must be documented. Concept scores are model signals, not factual labels, and may not substitute for source metadata.

Core concept-anchor groups are:

```js
[
  ["an abstract artwork", "a figurative artwork"],
  ["a minimal restrained artwork", "a visually dense detailed artwork"],
  ["a geometric structured composition", "an organic fluid composition"],
  ["an artwork with restrained color", "an artwork with saturated color"],
  ["a calm contemplative artwork", "a dramatic energetic artwork"],
  ["a traditional conventional artwork", "an experimental unconventional artwork"]
]
```

An `intimate / monumental` group may be added only if image presentation and metadata support a responsible interpretation. Phrase anchors neutrally, compare related concepts within the same group, version the prompts, and never create anchors for sensitive personal traits.

### Initial-pair construction

Create eight deterministic initial pairs from 16 quiz-pool works and save their IDs in `data/initial-pairs.json`. The pairs should:

- provide meaningful visual contrast across more than one dimension;
- collectively cover the range of the dataset;
- avoid repeatedly testing the same medium or period contrast;
- avoid near duplicates;
- avoid relying mainly on famous-versus-obscure recognition;
- contain no recommendation or holdout work.

Use a documented deterministic seed or preserve the final selected IDs so regeneration does not silently alter the quiz.

## 10. Dataset outputs and validation

Phase 1 produces:

```text
assets/artworks/*.jpg
data/artworks.json
data/embeddings.json
data/initial-pairs.json
data/dataset-report.md
```

The validator must return a nonzero exit code unless all of these pass:

1. Exactly 36 artwork records exist.
2. Roles total exactly 24 quiz, 6 recommendation, and 6 holdout.
3. Stable IDs and source-plus-source IDs are unique.
4. Every required field and local image exists; every image decodes.
5. Source URLs are syntactically valid.
6. Embedding keys match artwork IDs exactly.
7. All embeddings have one expected dimension and only finite values.
8. All embeddings have norm approximately 1.
9. Eight initial pairs exist, use quiz works only, and never repeat.
10. Recommendation and held-out IDs do not leak into initial pairs.

`data/dataset-report.md` records generation date, sources, role counts, balance summaries, image sizes, missing metadata, duplicate results, checkpoint and dimension, concept-prompt version, attribution for all works, and known limitations.

The report must also include candidate counts by source, rejection counts and reasons, final counts by medium, period band, region or culture field and source, image-size summary, quiz/recommendation/holdout counts, embedding validation result, and a source-and-attribution table for all 36 works.

### Preparation failure handling

- If a supplied record is incomplete, replace it during one-time preparation before Phase 1.
- If an image is missing, tiny, corrupt, or cannot decode, replace it before generating embeddings.
- If exactly 36 valid works cannot be reached, stop and report the missing records or sampling dimensions.
- If the model download fails, preserve the finished metadata and images and retry only after network access is available.
- If one embedding fails, retry that work once and then fail validation rather than writing mismatched output.
- If concept scoring fails, preserve valid image embeddings, report the concept output as incomplete, and stop before the phase gate.
- Do not restart the entire catalog process to fix one failed work.

## 11. Inference invariants

Keep vector arithmetic in small pure functions with beginner-readable names.

```text
contribution = chosen embedding - rejected embedding
preference = normalize(sum of contributions)
artwork score = dot(preference, normalized artwork embedding)
```

- **Neither / Unsure** produces no directional contribution.
- Never divide by zero.
- Use deterministic tie-breaking.
- Never display raw decimal similarity as a calibrated probability.
- Never mutate the frozen preference vector during the challenge.
- Missing metadata and concept scores are neutral.
- Use tiny fixed vectors in tests so expected results can be inspected by a beginner.

The adaptive information score may combine predicted-margin uncertainty, pair separation, under-covered dimensions, and repeat penalties. All weights live in `config.js`. Do not claim the heuristic is mathematically optimal.

Confidence may consider directional-answer quantity, reconstruction consistency, coverage, and contradiction. Map only to **Emerging**, **Moderate**, or **Strong** and include a short explanation.

Profile names come from a small documented mapping based on the strongest supported concept dimensions. Use a neutral fallback such as **The Eclectic Explorer** when evidence is mixed.

### Candidate-pair eligibility

Generate adaptive candidates from quiz-pool works only. For every candidate:

- reject the exact unordered pair if already shown;
- reject pairs containing recommendation or holdout works;
- allow an artwork to return in a different pairing when useful;
- favor at least one not-yet-seen artwork where possible;
- reject near-identical or almost-zero-separation pairs;
- track per-artwork display count and normally cap total exposure at three.

### Informative-pair score

For each eligible pair `(A, B)`, calculate:

```text
score(A) = dot(current preference vector, embedding A)
score(B) = dot(current preference vector, embedding B)
margin = abs(score(A) - score(B))
separation = 1 - cosineSimilarity(embedding A, embedding B)
```

A smaller margin indicates current uncertainty; adequate separation ensures the images are meaningfully different. Add small documented bonuses for under-shown media, period bands, geographic or cultural fields, and under-tested concept contrasts. Apply a repeat penalty for frequently shown works. Combine these factors using fixed weights in `config.js`, sort by final information score, and break all ties with stable artwork IDs.

Do not claim that this classroom heuristic is theoretically optimal. If no useful candidate remains, finish with the current evidence.

### Concept preference calculation

For every directional answer and each saved concept dimension:

1. add the chosen work’s concept score;
2. subtract the rejected work’s concept score;
3. aggregate across relevant responses;
4. normalize for the amount of relevant evidence;
5. track contradiction as well as support;
6. retain representative supporting and contradicting choice IDs.

An internal result may use this shape:

```js
{
  dimension: "composition",
  favoredLabel: "visually dense",
  strength: 0.61,
  confidence: "Moderate",
  supportingChoiceIds: ["pair-2", "pair-9"],
  contradictingChoiceIds: ["pair-6"]
}
```

Raw model scores must not be presented as self-explanatory human traits.

### Factual tendency calculation

Use only normalized source metadata for medium, period bands derived from dates, and cultural or geographic fields. Compare chosen-versus-rejected exposure; do not simply count selected works. A category encountered only once cannot support a strong conclusion. Missing values are neutral. Museum location is not artwork origin, and artist nationality is not automatically the work’s culture.

### Confidence calculation

Confidence combines:

- **quantity:** how many directional answers bear on the conclusion;
- **consistency:** how often the final preference direction reconstructs the visitor’s choices and how much contradiction exists;
- **coverage:** whether the visitor saw varied examples relevant to the dimension.

Map the result only to **Emerging**, **Moderate**, or **Strong**. Every label needs a short explanation. Frequent **Neither / Unsure** answers lower evidence and should produce an explicit emerging-profile message. Never show decimal certainty such as `93.71%`.

### Named profile and recommendations

- Choose a name from a small documented mapping using the two strongest sufficiently supported visual attributes.
- Display those attributes and confidence beside the name.
- Use a neutral mixed-evidence fallback.
- Never derive a name from a sensitive trait or imply diagnosis.
- Rank only `recommendation` works against the frozen final preference vector.
- Break equal recommendation scores by stable artwork ID.
- Return no more than four works.
- Explain each using supported concept-score or factual-metadata overlap.
- Never call the similarity value a probability or guarantee.

### Prediction challenge

Reserve exactly six holdout works and form exactly three fixed or deterministically generated pairs. For each pair:

1. score both works with the frozen preference vector;
2. save the higher-scoring work as the prediction before rendering the pair;
3. show the pair without revealing the prediction;
4. record left, right, or **Neither / Unsure**;
5. reveal the prediction and whether a directional choice agreed;
6. continue without updating the main preference vector.

Count agreement only for directional responses. Record **Neither / Unsure** as inconclusive rather than incorrect. Report agreements, directional trials, and inconclusive trials separately, followed by the required playful-check caveat.

### Application state

Keep state in memory only. Use a shape equivalent to:

```js
{
  stage: "welcome | initial | adaptive | results | challenge",
  initialIndex: 0,
  adaptiveCount: 0,
  answers: [],
  shownPairKeys: [],
  artworkDisplayCounts: {},
  preferenceVector: [],
  profileName: "",
  attributeResults: [],
  recommendations: [],
  frozenChallengeVector: [],
  challengePredictions: [],
  challengeAnswers: []
}
```

**Start Over** restores every field to its initial value. Page refresh also clears the session.

### Adaptive-round and result behavior

After eight initial comparisons, show a brief transition such as **Refining your profile…** and explain that follow-up questions investigate uncertainty. Display progress such as `Refinement 2 of up to 6`. Allow **Finish Now** only after the configured minimum of three adaptive comparisons, stop automatically at six, and finish early if no eligible informative pair remains. Do not reveal the predicted answer before the visitor chooses.

The dedicated result view must render:

- the controlled profile name and cautious two- or three-sentence summary;
- accessible scorecard scales with text labels and confidence;
- up to four strongest supported signals;
- important mixed or uncertain signals;
- representative chosen and rejected artworks;
- title, artist, year, source, and official link for revealed works;
- up to four local recommendations with traceable explanations;
- **Test My Profile** and **Start Over** actions.

Use phrases such as “Your choices suggest…” and “The evidence is mixed for…”. Do not use diagnostic, deterministic, or scientifically validated language.

## 12. Required automated tests

Use Node’s built-in test runner for deterministic tests of:

- vector addition, subtraction, normalization, and cosine similarity;
- zero-vector safety;
- **Neither / Unsure** neutrality;
- canonical unordered-pair keys;
- shown-pair and role exclusion;
- adaptive tie-breaking and exposure cap;
- confidence mapping;
- missing-metadata neutrality;
- controlled profile-name mapping and mixed fallback;
- recommendation filtering and stable ranking;
- frozen challenge vector;
- agreement and inconclusive scoring;
- complete restart.

Do not add a test framework unless the built-in runner is demonstrably insufficient.

## 13. Accessibility, responsive behavior, and failures

- Every action is keyboard operable with visible focus.
- Choice controls have clear accessible names.
- Alternative text is meaningful and factual.
- Information never relies on color alone.
- Differently proportioned images reserve space to limit layout shift.
- The comparison remains understandable at 375px width.
- Respect reduced-motion preferences.
- Missing images or data produce readable recovery states, never a blank page.
- If a quiz image fails, skip that pair and choose another eligible pair.
- If a challenge image fails, mark that trial unavailable; never replace it with a quiz work.
- An all-**Neither** or zero-vector session returns an honest insufficient-evidence state.

## 14. Privacy and security

- Keep visitor choices in JavaScript memory only.
- Clear all state on restart or refresh.
- Do not use local storage, cookies, analytics, accounts, or remote persistence.
- No production secret or environment variable is expected.
- Never commit or log secrets, tokens, model caches, temporary responses, or rejected candidate assets.
- Keep permissions limited to the current project, selected GitHub repository, and selected Vercel project.
- Use internet access only when necessary for package/model download, one-time catalog preparation, or source verification.

### Repository contents and caches

Commit the final web-ready images, normalized metadata, embeddings, concept scores, initial pairs, preparation and validation scripts, automated tests, dataset report, package manifest, and lockfile. Ignore all `.env*` files, dependency folders, model caches and weights, temporary source responses, rejected candidates, one-time research notes, operating-system files, local test output, and coverage output.

The committed repository must be sufficient to run and deploy the static site without contacting a museum, AI service, or model host.

### Permission boundaries

Use least privilege:

| Permission | Scope | Purpose |
|---|---|---|
| File editing | Current project folder | Build and validate project files |
| Internet during preparation | One task or explicitly approved operation | Verify sources and download npm packages or the public model |
| Model-cache writes | Project-specific ignored cache | Prevent model files entering Git |
| Git metadata | Current repository | Create phase checkpoints |
| GitHub access | Selected repository | Push the project only |
| Vercel access | Selected project | Deploy and verify only this site |
| Screen or accessibility access | Only when UI verification needs it | Inspect the local or public interface |

No new third-party account is required. Broad system or account access must not be requested when a narrower permission works.

### Preflight before Phase 1

Confirm all of the following before the full Phase 1 implementation:

1. Phase 0 passes locally and publicly.
2. The supplied catalog contains exactly 36 records and corresponding images.
3. Final images render in a browser.
4. Source and attribution entries exist for every work.
5. The selected CLIP-compatible checkpoint is documented and downloadable.
6. The checkpoint runs locally through `@huggingface/transformers`.
7. The model cache path is ignored.
8. One generated embedding contains finite numbers, has the expected dimension, and normalizes correctly.
9. Vercel can serve representative JSON and artwork assets.
10. No account, secret, backend, or production API is required.

### Failure-recovery order

When something breaks:

1. identify one observable symptom;
2. reproduce it consistently;
3. inspect the smallest relevant seam or data record;
4. change one thing;
5. rerun the relevant automated and manual checks;
6. use the supplied valid local catalog instead of restarting research;
7. restore the last working Git checkpoint only if a targeted repair is not practical;
8. reduce optional visual polish before reducing the core embedding and inference lesson.

Do not redesign the project because of one failed source record, model download, or layout defect.

## 15. Git, GitHub, and Vercel discipline

At the end of each phase:

1. Run dataset validation when applicable.
2. Run all automated tests.
3. Run every item in `CHECKS.md`.
4. Inspect phone and laptop presentation.
5. Report each result as pass or fail.
6. Report changed files, dependencies, data sources, and unresolved limitations.
7. Create the phase checkpoint only when the phase works.
8. Push to GitHub and wait for Vercel redeployment.
9. Test the public URL, not only localhost.
10. Stop and wait; do not begin the next phase.

The Vercel project remains static. Do not add Functions or environment variables without explicit scope approval.

## 16. Change discipline

- Work additively and preserve every passing earlier behavior.
- Put new data access behind `source.js`.
- Put new visible states behind `ui.js`.
- Put new tunable values in `config.js`.
- Extend existing functions or add small focused modules instead of reorganizing the project.
- Keep data preparation, inference, state coordination, and rendering separate.
- Avoid speculative abstraction and large rewrites.
- Implement one phase only.
- If something fails: **observe → reproduce → change one thing → retest**.

After each later phase, append the relevant new regression checks to `CHECKS.md` and update `CONTRACTS.md` for any approved additive contracts.

### Persistent rules for `README.md`

Write these rules into the project README during Phase 0 so they survive a new Codex conversation:

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

### Before implementation

Codex must:

1. confirm both final guideline files are present and have been read completely;
2. identify the explicitly requested phase;
3. inspect the repository structure and Git status;
4. read current contracts and regression checks;
5. verify passed behavior from earlier phases;
6. state the smallest files and dependencies expected to change;
7. identify any requested contract or scope conflict and stop if approval is required.

For Phase 1 model work, verify current official documentation for the selected CLIP-compatible checkpoint before installing or generating data.

### During implementation

- Keep retrieval, normalization, embedding generation, inference, application state, and rendering separate.
- Prefer simple named functions over compact or opaque code.
- Validate generated data continuously rather than waiting until the end.
- Preserve the prior public deployment path.
- Add only the minimum dependency required for the active phase.
- Do not invent artwork facts, hide uncertainty, or introduce later-phase behavior.
- Do not ask the student to perform routine terminal work or manual dataset collection.

### After implementation

1. Run the relevant preparation scripts.
2. Run dataset validation when applicable.
3. Run all automated inference tests.
4. Start the site locally and exercise observable acceptance paths.
5. Inspect phone and laptop layouts and keyboard behavior.
6. Force at least one safe failure and verify a readable error state.
7. Run `CHECKS.md` in full and report each result.
8. Fix concrete failures one at a time.
9. Create the phase checkpoint, push, and test the resulting public Vercel build.
10. Deliver the phase completion report and stop.

## 17. Excluded technology

Do not introduce:

- React, Next.js, Vue, Svelte, or another frontend framework;
- CSS frameworks, bundlers, UI libraries, or state libraries;
- production serverless routes or backends;
- databases, vector databases, authentication, or persistent storage;
- runtime AI, embeddings, image recognition, or LLM output;
- model training or fine-tuning;
- user uploads;
- museum APIs, web search, crawling, or Firecrawl in production;
- autonomous agents;
- recommendations outside the prepared local catalog;
- analytics, payments, email, messaging, Docker, or custom CI/CD;
- animation libraries or elaborate design systems.

If Codex believes an excluded component is necessary, it must explain why and wait for explicit approval before adding it.

## 18. Phase completion report

At each stop gate, Codex reports:

- phase completed;
- files created or changed;
- dependencies added, or `none`;
- data sources and preparation performed;
- automated test results;
- `CHECKS.md` results;
- local and public URLs tested;
- known limitations or unresolved failures;
- Git checkpoint and deployment status.

The student should not be asked to type routine terminal commands or gather project data manually.
