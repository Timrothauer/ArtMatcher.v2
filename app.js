import { config } from "./config.js";
import { createInitialState, createTasteResult } from "./inference.js";
import { source } from "./source.js";
import {
  clearResults,
  renderComparison,
  renderList,
  renderResults,
  renderReveal,
  renderWelcome,
  setBusy,
  setStatus,
  showEmpty,
  showError
} from "./ui.js";

const loadButton = document.querySelector("#load-button");
const emptyButton = document.querySelector("#empty-button");
const errorButton = document.querySelector("#error-button");
const clearButton = document.querySelector("#clear-button");

let state = createInitialState();
let data = null;

const waitForPreview = () => new Promise((resolve) => {
  window.setTimeout(resolve, config.previewDelayMilliseconds);
});

function artworkById(id) {
  return data.artworks.find((artwork) => artwork.id === id);
}

function showCurrentComparison() {
  const pair = data.pairs[state.initialIndex];
  state.stage = "initial";
  renderComparison({
    pair,
    left: artworkById(pair.leftId),
    right: artworkById(pair.rightId),
    index: state.initialIndex,
    total: config.initialComparisonCount,
    onChoose: recordChoice
  });
  setStatus(`Comparison ${state.initialIndex + 1} of ${config.initialComparisonCount}`);
}

function finishQuiz() {
  state.result = createTasteResult(state.answers, data.artworks, data.embeddings, config);
  state.preferenceVector = state.result.preferenceVector;
  state.stage = "results";
  renderResults(state.result, restart);
  setStatus("Your taste snapshot is ready.");
}

function continueAfterReveal() {
  state.initialIndex += 1;
  if (state.initialIndex >= config.initialComparisonCount) finishQuiz();
  else showCurrentComparison();
}

function recordChoice(choice) {
  if (state.stage !== "initial") return;
  const pair = data.pairs[state.initialIndex];
  const chosenId = choice === "left" ? pair.leftId : choice === "right" ? pair.rightId : "";
  const rejectedId = choice === "left" ? pair.rightId : choice === "right" ? pair.leftId : "";
  state.answers.push({ pairId: pair.id, leftId: pair.leftId, rightId: pair.rightId, choice, chosenId, rejectedId });
  state.stage = "reveal";
  renderReveal({
    left: artworkById(pair.leftId),
    right: artworkById(pair.rightId),
    choice,
    onContinue: continueAfterReveal
  });
  setStatus(choice === "neither" ? "Response recorded as Neither / Unsure." : "Choice recorded. Artwork details revealed.");
}

async function startQuiz() {
  setBusy(true);
  setStatus("Preparing the first comparison…");
  try {
    data = await source.load({ dataset: "profiler" });
    state = createInitialState();
    showCurrentComparison();
  } catch (error) {
    showError(error instanceof Error ? error.message : "The profiler could not be started.");
  } finally {
    setBusy(false);
  }
}

function restart() {
  state = createInitialState();
  data = null;
  renderWelcome(startQuiz);
  setStatus("Ready to discover your taste.");
}

async function loadFoundationPreview(scenario = "success") {
  clearResults();
  setBusy(true);
  setStatus("Loading the sample collection…");
  try {
    const items = await source.load({ scenario });
    await waitForPreview();
    if (items.length === 0) {
      showEmpty("The sample returned no items. Try loading the collection again.");
      setStatus("The sample collection is empty.");
      return;
    }
    renderList(items);
    setStatus(`${items.length} sample states loaded successfully.`);
  } catch (error) {
    showError(error instanceof Error ? error.message : "The preview could not be loaded.");
  } finally {
    setBusy(false);
  }
}

loadButton.addEventListener("click", () => loadFoundationPreview());
emptyButton.addEventListener("click", () => loadFoundationPreview("empty"));
errorButton.addEventListener("click", () => loadFoundationPreview("error"));
clearButton.addEventListener("click", () => {
  clearResults();
  setStatus("Results cleared. Ready for another preview.");
});

window.addEventListener("keydown", (event) => {
  if (state.stage !== "initial" || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === "ArrowLeft") recordChoice("left");
  if (event.key === "ArrowRight") recordChoice("right");
  if (event.key.toLowerCase() === "n") recordChoice("neither");
});

renderWelcome(startQuiz);
