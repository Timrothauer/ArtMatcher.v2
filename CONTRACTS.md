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

Phase 1 additively exports `renderWelcome`, `renderComparison`, `renderReveal`, and `renderResults`. All visible state and DOM mutation remains in `ui.js`.

## Data source methods

`source.js` exports an object named `source` with these permanent asynchronous methods:

- `source.load(params)`
- `source.detail(id)`
- `source.save(record)`
- `source.list()`

`source.load()` preserves the Phase 0 contract and returns an array of sample records. `source.load({ scenario: "empty" | "error" })` exercises the permanent foundation states. `source.load({ dataset: "profiler" })` additively returns the Phase 1 profiler bundle described below. `source.detail(id)` returns one sample or artwork record, or `null`. `save` and `list` throw `Not used in this project` because this project has no persistence.

## Phase 0 source record

```js
{
  id: "sample-observe",
  title: "Observe",
  description: "A fictional placeholder representing a future view."
}
```

## Phase 1 artwork record

```js
{
  id: "aic-65821",
  sourceId: "65821",
  source: "Art Institute of Chicago",
  sourceUrl: "https://…",
  title: "Composition (No. 1) Gray-Red",
  artist: "Piet Mondrian…",
  yearLabel: "1935",
  yearStart: 1935,
  yearEnd: 1935,
  medium: "Oil on canvas",
  cultureOrRegion: "Netherlands",
  department: "…",
  originalImageUrl: "https://…",
  imagePath: "assets/artworks/aic-65821.jpg",
  imageAlt: "…",
  rightsStatement: "Public Domain…",
  quizRole: "quiz | recommendation | holdout",
  conceptScores: {
    abstract: 0,
    figurative: 0,
    minimal: 0,
    visuallyDense: 0,
    geometric: 0,
    organic: 0,
    restrainedColor: 0,
    saturatedColor: 0,
    calm: 0,
    dramatic: 0,
    traditional: 0,
    experimental: 0
  }
}
```

The numeric concept-score examples above describe shape, not literal values. They are preparation-time model signals rather than factual source metadata.

## Embedding file and profiler bundle

`data/embeddings.json` has `{ metadata, embeddings }`. `metadata` always includes `package`, `packageVersion`, `checkpoint`, `revision`, `dtype`, `dimension`, `normTolerance`, `promptVersion`, `conceptGroups`, `imageHashes`, and `generatedAt`. `embeddings` maps every stable artwork ID to one normalized finite numeric array of the documented dimension.

`source.load({ dataset: "profiler" })` returns:

```js
{
  artworks: [],
  embeddings: {},
  embeddingMetadata: {},
  pairs: []
}
```

High-dimensional embeddings remain separate from artwork records and join only by stable artwork ID.

## Pair, answer, and state shapes

An initial pair is:

```js
{ id: "initial-1", leftId: "aic-65821", rightId: "aic-27992" }
```

An answer is:

```js
{
  pairId: "initial-1",
  leftId: "aic-65821",
  rightId: "aic-27992",
  choice: "left | right | neither",
  chosenId: "aic-65821",
  rejectedId: "aic-27992"
}
```

For `neither`, `chosenId` and `rejectedId` are `""`. Phase 1 application state is held only in memory:

```js
{
  stage: "welcome | initial | reveal | results",
  initialIndex: 0,
  answers: [],
  preferenceVector: [],
  result: null
}
```

Restart and refresh recreate this complete initial state. A taste result contains `insufficient`, `directionalCount`, `neitherCount`, `preferenceVector`, `supported`, `mixed`, and `representativeChoices` on every result.

## DO NOT CHANGE WITHOUT ASKING

Do not rename or remove any stable DOM ID, permanent `ui.js` export, permanent `source.js` method, or documented record key without explicit approval. Do not change the meanings or return shapes of these seams without explicit approval. Additive contracts must preserve all existing behavior.
