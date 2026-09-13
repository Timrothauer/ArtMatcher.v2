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

`ui.js` exports exactly these permanent foundation functions:

- `setBusy(isBusy)`
- `setStatus(message)`
- `showError(message)`
- `showEmpty(message)`
- `renderList(items)`
- `clearResults()`

## Data source methods

`source.js` exports an object named `source` with these permanent asynchronous methods:

- `source.load(params)`
- `source.detail(id)`
- `source.save(record)`
- `source.list()`

`save` and `list` throw `Not used in this project` because this project has no persistence.

## Phase 0 source record

```js
{
  id: "sample-observe",
  title: "Observe",
  description: "A fictional placeholder representing a future view."
}
```

All methods return plain values. `source.load()` returns an array of records. `source.detail(id)` returns one record or `null`.

## Future additive contracts

Artwork, embedding, pair, answer, and application-state shapes will be documented when Phase 1 introduces them. High-dimensional embeddings will remain separate from artwork records and join by stable artwork ID.

## DO NOT CHANGE WITHOUT ASKING

Do not rename or remove any stable DOM ID, permanent `ui.js` export, permanent `source.js` method, or documented record key without explicit approval. Do not change the meanings or return shapes of these seams without explicit approval. Additive contracts must preserve all existing behavior.
