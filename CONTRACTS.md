# Art Taste Profiler Contracts

These seams are permanent from Phase 0 onward. Missing string values use `""`, missing scalar values use `null`, and missing collections use `[]`. Contract keys are never omitted.

## Stable DOM IDs

- `main-content`
- `page-title`
- `workspace-title`
- `controls-region`
- `status-line`
- `view-region`
- `load-button`
- `empty-button`
- `error-button`
- `clear-button`

## UI module exports

`ui.js` preserves these six permanent foundation functions:

- `setBusy(isBusy)`
- `setStatus(message)`
- `showError(message)`
- `showEmpty(message)`
- `renderList(items)`
- `clearResults()`

Phase 1 additively introduced `renderWelcome`, `renderComparison`, `renderReveal`, and `renderResults`. Phase 2 additively introduced `renderRefinementIntro`, `renderChallengeComparison`, `renderChallengeReveal`, and `renderChallengeSummary`. The post-Phase 2 UX pass additively introduces `setDiagnosticsVisible`; foundation controls retain every stable ID but are hidden unless `?diagnostics=1` is present or the configuration flag is enabled. All visible state and DOM mutation remains in `ui.js`.

## Data source methods

`source.js` exports an object named `source` with these permanent asynchronous methods:

- `source.load(params)`
- `source.detail(id)`
- `source.save(record)`
- `source.list()`

`source.load()` preserves the Phase 0 contract and returns an array of sample records. `source.load({ scenario: "empty" | "error" })` exercises the permanent foundation states. `source.load({ dataset: "profiler" })` returns the profiler bundle described below. `source.detail(id)` returns one sample or artwork record, or `null`. `save` and `list` throw `Not used in this project` because this project has no persistence.

## Source records and profiler bundle

The Phase 0 sample record remains:

```js
{ id: "sample-observe", title: "Observe", description: "A fictional placeholder representing a future view." }
```

The artwork contract includes every documented metadata key plus all twelve concept-score keys. `quizRole` is exactly `quiz`, `recommendation`, or `holdout`.

Artwork display metadata follows these permanent formatting rules: `artist` contains concise named creators or `""` without nationality, lifespan, or birth/death prose; `yearLabel` uses `c.` for approximation, `BCE`/`CE` for eras, and en dashes for ranges; `cultureOrRegion` uses a stable broad place label, with a documented culture in parentheses when useful; `movementOrStyle` uses one concise controlled movement, school, period style, or cultural tradition supported by the institutional record and established art-historical terminology. Original institutional wording remains available through `sourceUrl` and is not reconstructed or invented when a display value is missing.

`data/embeddings.json` remains `{ metadata, embeddings }`. `metadata` includes `package`, `packageVersion`, `checkpoint`, `revision`, `dtype`, `dimension`, `normTolerance`, `promptVersion`, `conceptGroups`, `imageHashes`, and `generatedAt`. `embeddings` maps every stable artwork ID to one normalized finite numeric array.

`source.load({ dataset: "profiler" })` returns:

```js
{ artworks: [], embeddings: {}, embeddingMetadata: {}, pairs: [] }
```

High-dimensional embeddings remain separate from artwork records and join only by stable artwork ID.

## Pair and answer shapes

An initial pair remains:

```js
{ id: "initial-1", leftId: "aic-65821", rightId: "aic-27992" }
```

An adaptive pair additively includes inspectable heuristic fields:

```js
{
  id: "adaptive-aic-11143::met-436532",
  leftId: "aic-11143",
  rightId: "met-436532",
  key: "aic-11143::met-436532",
  margin: 0,
  separation: 0,
  informationScore: 0,
  includesUnseen: true
}
```

The numeric examples describe shape, not literal output. A quiz answer is:

```js
{
  pairId: "initial-1",
  leftId: "aic-65821",
  rightId: "aic-27992",
  choice: "left | right | neither",
  chosenId: "aic-65821",
  rejectedId: "aic-27992",
  round: "initial | adaptive"
}
```

For `neither`, `chosenId` and `rejectedId` are `""`.

## Phase 2 application state

State is held only in memory and always has this complete shape:

```js
{
  stage: "welcome | initial | refinement | adaptive | reveal | results | challenge | challengeReveal | challengeSummary",
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
  challengeAnswers: [],
  challengeIndex: 0,
  currentPair: null,
  currentRound: "",
  unavailableArtworkIds: [],
  result: null
}
```

Restart and refresh recreate this complete initial state.

## Result and evidence shapes

A taste result preserves the Phase 1 keys and additively contains:

```js
{
  insufficient: false,
  directionalCount: 0,
  neitherCount: 0,
  preferenceVector: [],
  supported: [],
  mixed: [],
  representativeChoices: [],
  attributeResults: [],
  factualTendencies: [],
  preferredMovementStyles: [],
  profileName: "The Eclectic Explorer",
  profileAttributes: [],
  recommendations: [],
  overallConfidence: {
    label: "Emerging | Moderate | Strong",
    score: 0,
    quantity: 0,
    consistency: 0,
    coverage: 0
  }
}
```

Each attribute result contains `dimension`, `label`, `oppositeLabel`, `strength`, `position`, `mixed`, `confidence`, `confidenceScore`, `evidenceCount`, `supportingChoiceIds`, and `contradictingChoiceIds`. Internal numeric scores support transparent ordering and rendering but are never presented as calibrated probabilities.

Each recommendation contains `{ artwork, score, explanation, matchingSignals }`. `artwork.quizRole` must be `recommendation`; the score is an internal similarity used only for deterministic ranking.

## Controlled profile-name mapping

`config.profileNameRules` is the only approved name map. It currently permits:

- The Quiet Formalist
- The Narrative Traditionalist
- The Chromatic Experimentalist
- The Abstract Architect
- The Poetic Naturalist
- The Dramatic Maximalist
- The Essentialist
- The Narrative Dramatist
- The Abstract Experimentalist
- The Constructive Experimentalist
- The Eclectic Explorer as the neutral mixed or unmapped fallback

Names use only sufficiently supported visual attributes. They never use sensitive traits or imply diagnosis.

## Challenge shapes

A challenge pair is fixed deterministically from two holdout works:

```js
{ id: "challenge-1", leftId: "…", rightId: "…", predictedId: "…" }
```

`predictedId` is recorded from `frozenChallengeVector` before the pair renders. A challenge answer always contains:

```js
{
  pairId: "challenge-1",
  leftId: "…",
  rightId: "…",
  predictedId: "…",
  choice: "left | right | neither | unavailable",
  chosenId: "",
  agreed: false
}
```

Challenge scoring returns `{ agreements, directionalTrials, inconclusiveTrials, unavailableTrials }`. Challenge answers never enter the main `answers` collection and never update the frozen vector.

## DO NOT CHANGE WITHOUT ASKING

Do not rename or remove any stable DOM ID, permanent `ui.js` export, permanent `source.js` method, or documented record key without explicit approval. Do not change the meanings or return shapes of these seams without explicit approval. Additive contracts must preserve all existing behavior.
