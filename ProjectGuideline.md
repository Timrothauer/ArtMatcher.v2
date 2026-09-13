# Art Taste Profiler — Project Guideline

**Audience:** Codex and the student builder  
**Project category:** AI interpretation using prepared model outputs  
**Target duration:** Several focused hours  
**Deployment:** GitHub and Vercel Hobby  
**Companion file:** `TechnicalGuideline.md`

## 1. Purpose

Build a small, image-led website that helps people who recognize art they like when they see it but struggle to describe why. The visitor makes pairwise artwork choices, and the site turns those choices into a named, explainable **taste snapshot** with attribute scores, supporting examples, local-catalog recommendations, and a short prediction challenge.

The product is an educational visual-preference experiment. It is not a psychological assessment, a scientific classification, or a permanent description of the visitor.

## Core learning outcomes

The project should teach the student to explain, in plain language:

- how an image can be represented as a numeric embedding;
- how cosine similarity compares vector directions;
- the difference between using a pretrained model and training a new model;
- why CLIP runs once during local preparation instead of for every site visitor;
- how a selected-minus-rejected update turns pairwise choices into a preference direction;
- how adaptive questions investigate uncertainty rather than merely repeat likely favorites;
- why CLIP-derived visual signals and factual museum metadata serve different purposes;
- how confidence represents the quantity, consistency, and coverage of evidence rather than certainty;
- how Git checkpoints, GitHub, and Vercel support a controlled phase-by-phase build.

The student does not need to memorize model architecture, matrix algebra, framework syntax, or routine terminal commands. Codex performs routine project commands and data preparation; the student focuses on product judgment, inspection, testing, and understanding.

## 2. MVP pitch

**Art Taste Profiler** helps visually curious people identify patterns in their artistic preferences by choosing between artworks. It combines precomputed CLIP image embeddings, transparent browser-side scoring, factual artwork metadata, and a prepared local catalog to explain what the visitor appears to favor and recommend unseen works they may enjoy.

## 3. Job to be done

> **When** I find myself drawn to certain artworks but cannot explain why, **I want to** identify patterns in my visual reactions, **so I can** understand and confidently express my art taste.

- **Functional job:** Identify recurring visual preferences.
- **Emotional job:** Feel more confident and curious about personal taste.
- **Social job:** Discuss art with others in a more thoughtful and informed way.

## 4. Intended user

The primary user is someone who:

- enjoys looking at art;
- can react instinctively to an image;
- may not know art-history terminology;
- wants a quick, visual experience rather than a long questionnaire;
- understands that the result is exploratory.

No prior knowledge, account, payment, or manual data entry is required.

## 5. Required experience

### Welcome

Show:

- the name **Art Taste Profiler**;
- one short explanation;
- a clear **Discover My Taste** action;
- a note that the result is an experimental taste snapshot.

Do not lead with a technical explanation of CLIP.

### Initial quiz

- Present two large artwork images side by side.
- Ask: **Which work are you more drawn to?**
- Allow left, right, and **Neither / Unsure** responses.
- Show progress through eight fixed comparisons.
- Hide identifying artwork labels until after each decision.
- Support mouse, touch, and keyboard interaction.

### Adaptive refinement

- After the eight initial comparisons, calculate the current preference vector.
- Ask up to six additional comparisons selected by a deterministic uncertainty heuristic.
- Explain that these questions are refining the snapshot.
- Permit **Finish Now** after at least three adaptive comparisons.
- Never repeat the same unordered pair.
- Finish early if no useful pair remains.

### Result

Display:

- a controlled, memorable profile name;
- a two- or three-sentence cautious summary;
- a labeled attribute scorecard;
- strongest supported affinities;
- rejected, mixed, or uncertain tendencies;
- confidence labels of **Emerging**, **Moderate**, or **Strong**;
- representative choices with artwork facts and official source links;
- up to four explained recommendations from the local recommendation pool;
- **Test My Profile** and **Start Over** actions.

Use language such as “Your choices suggest…” and “The evidence is mixed for…”. Never claim that the system knows the visitor’s true or permanent taste.

The profile name must come from a small documented set and be derived from the two strongest sufficiently supported visual attributes. Examples include **The Chromatic Experimentalist**, **The Quiet Formalist**, **The Narrative Traditionalist**, and **The Eclectic Explorer**. Use **The Eclectic Explorer**, or another documented neutral fallback, when evidence is mixed. Display the supporting attributes and confidence directly beside the name.

The scorecard should cover the approved concept dimensions using accessible labeled scales and text. Prefer rounded positions or qualitative labels over false decimal precision. Mark an unsupported dimension as **Emerging** or **Unclear** rather than forcing a direction.

Show no more than four strongest conclusions. Each should include a label, confidence, concise explanation, and two representative works where possible. Separately show important mixed or uncertain signals. Artwork facts revealed after the quiz should include image, title, artist, year, source, and official source link.

### Prediction challenge

- Use six held-out artworks arranged as three pairs.
- Freeze the final preference vector before the challenge.
- Record the predicted choice before the visitor responds.
- Reveal whether each directional response agrees with the prediction.
- Treat **Neither / Unsure** as inconclusive, not incorrect.
- Report agreements, directional trials, and inconclusive trials.
- Show: **This three-pair challenge is a playful check of the current snapshot, not a scientific accuracy test.**

### Restart

**Start Over** clears all session state and returns to the welcome screen.

## 6. Prepared artwork catalog

Codex supplies and prepares the complete catalog. The student must not be asked to search for artworks, download or rename images, transcribe metadata, assign tags, remove duplicates, or generate embeddings manually.

The final local dataset contains exactly 36 unique artworks:

- 24 `quiz` works;
- 6 `recommendation` works;
- 6 `holdout` works.

Every artwork requires a stable ID, usable local image, title, source name, official source URL, local image path, and available credit or rights information. Creator, date, medium, department, and cultural or geographic fields must be retained when available. Missing optional facts remain empty or `null`; Codex must never invent them.

The set should vary across media, periods, regions, abstraction, representation, color, density, composition, subject, and mood. Avoid confounded sampling—for example, a set in which every abstract work is colorful or every East Asian work is historical.

Public institutional sources may be consulted once during Codex’s preparation work. The submitted project contains local assets and provenance, not museum API integrations, bulk retrieval tooling, or live museum dependencies.

Recommended institutional sources include the Metropolitan Museum of Art, the Art Institute of Chicago, and the Cleveland Museum of Art, with another reputable collection source only if balance requires it. Source terms and rights statements must be inspected. Prefer open-access images where practical, preserve credits, and never imply that educational or personal intent automatically removes copyright obligations.

Automated or assisted sourcing must be followed by Codex visual inspection. Reject broken or tiny images, duplicate or near-duplicate works, poor crops, unclear installation documentation, images dominated by frames or blank space, and a final selection overly concentrated in one source, style, medium, period, or region.

## 7. How inference works

CLIP provides a numeric visual representation for each artwork during one-time local preparation. It does not decide the visitor’s taste and it does not run in production.

For a directional comparison:

```text
pair contribution = chosen embedding - rejected embedding
preference vector = normalize(sum of directional contributions)
```

**Neither / Unsure** is recorded but contributes no direction. Similarity between the preference vector and an artwork is calculated with cosine similarity, or equivalently the dot product of normalized vectors.

The explanation combines three different evidence types without confusing them:

1. **Visual similarity:** precomputed CLIP embeddings.
2. **Interpretable visual signals:** precomputed scores for documented concept pairs.
3. **Facts:** source metadata for artist, year, medium, and geography.

Approved concept pairs include:

- abstract / figurative;
- minimal / visually dense;
- geometric / organic;
- restrained / saturated color;
- calm / dramatic;
- traditional / experimental.

Concept scores are model signals, not objective artwork facts. Sensitive traits—including race, nationality, gender, age, politics, health, intelligence, and personality—must never be inferred.

Factual tendencies may use normalized source metadata for medium, a period band derived from year, and culture or geography when present. Compare selected and rejected exposure rather than merely counting selected works. A category shown only once cannot support a strong conclusion. Missing metadata is neutral; a museum’s location is not the artwork’s origin, and an artist’s nationality must not automatically be substituted for the work’s culture.

## 8. Adaptive selection and recommendations

The adaptive selector is a fixed heuristic, not an autonomous agent. It should:

1. exclude pairs already shown;
2. exclude recommendation and holdout works;
3. avoid nearly identical pairs;
4. favor pairs with a small predicted preference margin;
5. favor under-covered visual or factual dimensions;
6. penalize repeatedly displayed artworks;
7. break ties by stable artwork ID.

Recommendation ranking uses only the six `recommendation` works. Rank them by similarity to the frozen final preference vector, return up to four, and explain each with supported visual signals or factual overlap. A similarity score is not a probability that the visitor will like the artwork.

The adaptive round may reuse an artwork in a new pairing when useful, but should favor at least one previously unseen quiz work in each pair where possible. Maintain display counts and normally cap each artwork at three total appearances. Do not show the selector’s predicted preference before the visitor answers.

## 9. Visual direction

Use the British Museum and V&A websites as mood references without copying their branding or layouts.

Aim for:

- a museum-editorial, image-first presentation;
- bold typography and generous spacing;
- restrained supporting colors;
- strong artwork presentation without distortion;
- minimal, obvious controls;
- a clear welcome → quiz → refinement → result → challenge progression;
- polished phone and laptop layouts;
- visible focus and restrained motion.

Artwork remains the dominant visual material.

## 10. Build phases and stop gates

Codex must implement only the phase explicitly requested. A later phase may not begin until the current phase passes, is committed, is pushed, and works at the public Vercel URL.

### Phase 0 — Foundation and deployment

**Goal:** Establish stable project seams and prove the local → GitHub → Vercel path before feature work.

Create the foundation defined in `TechnicalGuideline.md`, including the UI, data-source, configuration, contract, and regression-check files. Use only hand-written sample data. Demonstrate busy, status, success, empty, and readable error states. Install nothing and add no product feature, model, real artwork dataset, API, or backend.

**Acceptance criteria:**

1. The foundation structure in `TechnicalGuideline.md` exists.
2. The page opens locally with no console error.
3. The primary action produces a result from hand-written sample data.
4. Busy, status, success, empty, and readable error states have each been seen on screen.
5. The layout is usable at 375px width and keyboard focus is visible.
6. `CONTRACTS.md` records permanent seams and `CHECKS.md` passes in full.
7. No package, API, secret, model, real artwork dataset, or backend has been added.
8. A Git checkpoint exists and is pushed to GitHub.
9. Vercel displays the page at a public URL that another browser can open.

**Gate:** Create the checkpoint `Phase 0 - foundation and deployment`, report every acceptance result, and stop. Do not begin Phase 1 until the public version passes.

### Phase 1 — Prepared dataset, embeddings, and core profiler

**Goal:** Deliver the fixed eight-comparison taste-profiler loop.

Codex prepares and visually reviews the balanced 36-work local catalog; normalizes and verifies factual metadata; assigns 24 quiz, 6 recommendation, and 6 holdout roles; generates normalized CLIP embeddings and concept scores; creates eight deterministic initial pairs; builds the welcome, comparison, basic result, and restart flows; and adds small deterministic inference tests.

The Phase 1 result may be simpler than the final result, but it must already show a summary, strongest affinities, mixed evidence, representative works, and official source links.

**Acceptance criteria:**

1. Every Phase 0 check continues to pass.
2. The local catalog contains exactly 36 unique records and 36 usable local images.
3. Roles total exactly 24 quiz, 6 recommendation, and 6 holdout.
4. Every record has a stable ID, title, source, source URL, and valid local image.
5. Artwork and embedding IDs match exactly.
6. Every embedding has the documented dimension, contains finite values, and is normalized within the documented tolerance.
7. Concept scores exist for all approved core concept groups.
8. Eight valid deterministic initial pairs use quiz works only.
9. Model caches, rejected candidates, temporary source material, and secrets are ignored by Git.
10. The visitor can complete all eight comparisons using mouse, touch, or keyboard.
11. **Neither / Unsure** records a response without forcing a preference direction.
12. Different deterministic answer patterns produce observably different results.
13. An all-**Neither** path produces an honest insufficient-evidence result rather than an error.
14. Restart clears the complete in-memory session.
15. Phone and laptop layouts remain usable.
16. Dataset validation and inference tests pass.
17. No API key, runtime model, runtime image analysis, or external data request is needed.
18. The production deployment passes the complete regression list.

**Gate:** Create the checkpoint `Phase 1 - dataset embeddings and core profiler`, push, test the public deployment, report sources, files, dependencies, dataset QA, tests, and limitations, then stop.

### Phase 2 — Adaptive inference, recommendations, challenge, and polish

**Goal:** Make the result more informative, explainable, and testable without adding infrastructure.

Add the deterministic adaptive round, confidence logic, controlled named-profile mapping, attribute scorecard, mixed-evidence handling, traceable explanations, local-catalog recommendations, frozen-vector prediction challenge, accessibility refinements, responsive images, reduced-motion behavior, and museum-editorial polish.

**Acceptance criteria:**

1. Every Phase 1 behavior and regression check continues to pass.
2. Adaptive selection is deterministic for a fixed response history.
3. No exact unordered pair repeats.
4. Recommendation and holdout works never appear in quiz comparisons.
5. Follow-up questions favor uncertainty and meaningful separation rather than only top-ranked works.
6. Artwork exposure respects the documented cap where eligible alternatives exist.
7. The visitor may finish after the configured minimum and the round stops after six questions.
8. Results separate strong, moderate, emerging, and mixed evidence without false precision.
9. Every conclusion can be traced to concept scores, factual metadata, or recorded choices.
10. The controlled profile name follows the documented mapping and displays its supporting attributes.
11. The scorecard is labeled, keyboard accessible, readable without color, and honest about insufficient evidence.
12. Only recommendation-role works appear under **You May Also Like**.
13. Up to four recommendations are ranked deterministically and include traceable explanations.
14. Exactly six holdout works form three prediction pairs.
15. Predictions are recorded before answers, and held-out answers never change the main preference vector.
16. Agreement, directional-trial, and inconclusive counts are correct.
17. The challenge caveat is visible.
18. Restart clears quiz, adaptive, result, recommendation, and challenge state.
19. Keyboard, touch, phone, laptop, image-failure, and reduced-motion paths work.
20. Automated tests, `CHECKS.md`, and the public Vercel deployment pass.

**Gate:** Create the checkpoint `Phase 2 - adaptive inference prediction challenge and polish`, push, test the public deployment, report algorithm changes, test results, limitations, and unresolved issues, then stop.

## 11. Edge cases

Handle without a blank page:

- failed JSON or image loading;
- missing or invalid local files;
- duplicate IDs or images;
- mismatched or non-finite embeddings;
- missing optional metadata or concept scores;
- zero-length preference vectors;
- repeated **Neither / Unsure** answers;
- insufficient, contradictory, or mixed evidence;
- no useful adaptive pair remaining;
- a held-out image failing during the challenge;
- restart at any stage.

When evidence is insufficient, say so and offer additional comparisons or restart. Never manufacture confidence to fill the result page.

## 12. Explicitly out of scope

Do not add:

- ML training or fine-tuning;
- runtime CLIP, embeddings, image recognition, detection, or classification;
- paid or hosted AI inference;
- LLM-generated results;
- frontend frameworks or UI libraries;
- production serverless functions or another backend;
- databases, vector databases, authentication, or persistent profiles;
- local storage, personalization cookies, analytics, or personal-data collection;
- user uploads;
- web search, crawling, Firecrawl, or museum APIs in production;
- live exhibitions or recommendations outside the prepared local catalog;
- autonomous agents;
- payments, email, messaging, Docker, or custom CI/CD;
- scientific, psychological, or sensitive-personal-attribute claims;
- elaborate animation or a large design system.

If an excluded item appears necessary, Codex must stop and explain the need before changing scope.

## 13. Definition of done

At the public URL, an uncoached visitor can:

1. understand the product;
2. finish eight initial and up to six adaptive comparisons;
3. receive a cautious named profile and readable attribute scorecard;
4. see why the site reached its conclusions;
5. distinguish strong signals from uncertainty;
6. explore explained recommendations from unseen local works;
7. run the three-pair prediction challenge;
8. restart cleanly;
9. use the full experience on phone or laptop with mouse, touch, or keyboard.

The student can explain that CLIP created visual representations during preparation, while simple, transparent browser logic inferred a direction from the visitor’s choices.

## 14. Possible later directions — not part of this build

After the complete MVP is understood and working, a separately approved future project might explore:

- a larger and more diverse artwork catalog;
- additional institutional sources;
- persistent or longitudinal profiles;
- user-uploaded images;
- comparing different embedding models;
- formal user research and calibration;
- live exhibition or external-catalog recommendations;
- opt-in profile sharing;
- locally running browser inference.

These ideas do not authorize implementation now. They require explicit new scope because they may change privacy, data, hosting, performance, or account requirements.
