import { config } from "./config.js";
import { source } from "./source.js";
import {
  clearResults,
  renderList,
  setBusy,
  setStatus,
  showEmpty,
  showError
} from "./ui.js";

const loadButton = document.querySelector("#load-button");
const emptyButton = document.querySelector("#empty-button");
const errorButton = document.querySelector("#error-button");
const clearButton = document.querySelector("#clear-button");

const waitForPreview = () => new Promise((resolve) => {
  window.setTimeout(resolve, config.previewDelayMilliseconds);
});

async function loadPreview(scenario = "success") {
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

loadButton.addEventListener("click", () => loadPreview());
emptyButton.addEventListener("click", () => loadPreview("empty"));
errorButton.addEventListener("click", () => loadPreview("error"));
clearButton.addEventListener("click", () => {
  clearResults();
  setStatus("Results cleared. Ready for another preview.");
});
