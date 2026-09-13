import { config } from "./config.js";
import {
  createChallenge,
  createInitialState,
  createTasteResult,
  pairKey,
  preferenceFromAnswers,
  scoreChallenge,
  selectAdaptivePair
} from "./inference.js";
import { source } from "./source.js";
import {
  clearResults,
  renderChallengeComparison,
  renderChallengeReveal,
  renderChallengeSummary,
  renderComparison,
  renderList,
  renderRefinementIntro,
  renderResults,
  renderReveal,
  renderWelcome,
  setBusy,
  setDiagnosticsVisible,
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

function markQuizPairShown(pair) {
  const key = pairKey(pair.leftId, pair.rightId);
  if (state.shownPairKeys.includes(key)) return;
  state.shownPairKeys.push(key);
  state.artworkDisplayCounts[pair.leftId] = (state.artworkDisplayCounts[pair.leftId] ?? 0) + 1;
  state.artworkDisplayCounts[pair.rightId] = (state.artworkDisplayCounts[pair.rightId] ?? 0) + 1;
}

function showQuizPair(pair, round) {
  state.currentPair = pair;
  state.currentRound = round;
  state.stage = round;
  markQuizPairShown(pair);
  const isAdaptive = round === "adaptive";
  const index = isAdaptive ? state.adaptiveCount : state.initialIndex;
  const total = isAdaptive ? config.adaptiveComparisonCount : config.initialComparisonCount;
  renderComparison({
    left: artworkById(pair.leftId),
    right: artworkById(pair.rightId),
    index,
    total,
    round: isAdaptive ? "Refinement" : "Comparison",
    onChoose: recordQuizChoice,
    onFinish: isAdaptive && state.adaptiveCount >= config.minimumAdaptiveAnswers ? finishQuiz : null,
    onImageError: (artworkId) => handleQuizImageFailure(pair.id, artworkId)
  });
  setStatus(`${isAdaptive ? "Refinement" : "Comparison"} ${index + 1} of ${total}`);
}

function showCurrentInitialComparison() {
  showQuizPair(data.pairs[state.initialIndex], "initial");
}

function adaptivePair() {
  state.preferenceVector = preferenceFromAnswers(state.answers, data.embeddings);
  return selectAdaptivePair({
    artworks: data.artworks,
    embeddings: data.embeddings,
    preferenceVector: state.preferenceVector,
    answers: state.answers,
    shownPairKeys: state.shownPairKeys,
    displayCounts: state.artworkDisplayCounts,
    config,
    excludedIds: state.unavailableArtworkIds
  });
}

function showNextAdaptiveComparison() {
  const pair = adaptivePair();
  if (!pair) {
    finishQuiz();
    return;
  }
  showQuizPair(pair, "adaptive");
}

function beginRefinement() {
  state.preferenceVector = preferenceFromAnswers(state.answers, data.embeddings);
  state.stage = "refinement";
  renderRefinementIntro(showNextAdaptiveComparison);
  setStatus("The first eight choices are complete. Refinement is ready.");
}

function finishQuiz() {
  state.result = createTasteResult(state.answers, data.artworks, data.embeddings, config);
  state.preferenceVector = [...state.result.preferenceVector];
  state.profileName = state.result.profileName;
  state.attributeResults = state.result.attributeResults;
  state.recommendations = state.result.recommendations;
  state.stage = "results";
  renderResults(state.result, { onRestart: restart, onChallenge: startChallenge });
  setStatus("Your refined taste snapshot is ready.");
}

function continueAfterReveal() {
  if (state.currentRound === "initial") {
    state.initialIndex += 1;
    if (state.initialIndex >= config.initialComparisonCount) beginRefinement();
    else showCurrentInitialComparison();
    return;
  }
  if (state.adaptiveCount >= config.adaptiveComparisonCount) finishQuiz();
  else showNextAdaptiveComparison();
}

function recordQuizChoice(choice) {
  if (state.stage !== "initial" && state.stage !== "adaptive") return;
  const pair = state.currentPair;
  const round = state.currentRound;
  const chosenId = choice === "left" ? pair.leftId : choice === "right" ? pair.rightId : "";
  const rejectedId = choice === "left" ? pair.rightId : choice === "right" ? pair.leftId : "";
  state.answers.push({ pairId: pair.id, leftId: pair.leftId, rightId: pair.rightId, choice, chosenId, rejectedId, round });
  if (round === "adaptive") state.adaptiveCount += 1;
  state.stage = "reveal";
  renderReveal({
    left: artworkById(pair.leftId),
    right: artworkById(pair.rightId),
    choice,
    round,
    onContinue: continueAfterReveal,
    onChange: changeQuizChoice,
    onFinish: round === "adaptive" && state.adaptiveCount >= config.minimumAdaptiveAnswers ? finishQuiz : null
  });
  setStatus(choice === "neither" ? "Response recorded as Neither / Unsure." : "Choice recorded. Artwork details revealed.");
}

function changeQuizChoice() {
  if (state.stage !== "reveal") return;
  const answer = state.answers[state.answers.length - 1];
  if (!answer || answer.pairId !== state.currentPair?.id) return;
  state.answers.pop();
  if (state.currentRound === "adaptive") state.adaptiveCount -= 1;
  showQuizPair(state.currentPair, state.currentRound);
  setStatus("Choose again. Your previous response to this pair was removed.");
}

function handleQuizImageFailure(pairId, artworkId) {
  if ((state.stage !== "initial" && state.stage !== "adaptive") || state.currentPair?.id !== pairId) return;
  if (!state.unavailableArtworkIds.includes(artworkId)) state.unavailableArtworkIds.push(artworkId);
  const replacement = adaptivePair();
  if (!replacement) {
    if (state.currentRound === "adaptive") finishQuiz();
    else showError("An artwork image was unavailable and no safe replacement comparison could be prepared. Please start over.");
    return;
  }
  showQuizPair(replacement, state.currentRound);
  setStatus("One image was unavailable, so that pair was skipped and replaced.");
}

async function startQuiz() {
  setBusy(true);
  setStatus("Preparing the first comparison…");
  try {
    data = await source.load({ dataset: "profiler" });
    state = createInitialState();
    showCurrentInitialComparison();
  } catch (error) {
    showError(error instanceof Error ? error.message : "The profiler could not be started.");
  } finally {
    setBusy(false);
  }
}

function showChallengePair() {
  const pair = state.challengePredictions[state.challengeIndex];
  state.stage = "challenge";
  state.currentPair = pair;
  renderChallengeComparison({
    left: artworkById(pair.leftId),
    right: artworkById(pair.rightId),
    index: state.challengeIndex,
    total: config.challengePairCount,
    onChoose: recordChallengeChoice,
    onImageError: () => recordUnavailableChallenge(pair.id)
  });
  setStatus(`Profile challenge ${state.challengeIndex + 1} of ${config.challengePairCount}`);
}

function startChallenge() {
  const challenge = createChallenge(data.artworks, data.embeddings, state.preferenceVector, config.challengePairCount);
  if (challenge.pairs.length !== config.challengePairCount) {
    showError("The profile challenge could not prepare all three held-out pairs.");
    return;
  }
  state.frozenChallengeVector = challenge.frozenVector;
  state.challengePredictions = challenge.pairs;
  state.challengeAnswers = [];
  state.challengeIndex = 0;
  showChallengePair();
}

function recordChallengeChoice(choice) {
  if (state.stage !== "challenge") return;
  const pair = state.challengePredictions[state.challengeIndex];
  const chosenId = choice === "left" ? pair.leftId : choice === "right" ? pair.rightId : "";
  const answer = {
    pairId: pair.id,
    leftId: pair.leftId,
    rightId: pair.rightId,
    predictedId: pair.predictedId,
    choice,
    chosenId,
    agreed: Boolean(chosenId) && chosenId === pair.predictedId
  };
  state.challengeAnswers.push(answer);
  state.stage = "challengeReveal";
  renderChallengeReveal({
    left: artworkById(pair.leftId),
    right: artworkById(pair.rightId),
    predictionId: pair.predictedId,
    choice,
    agreed: answer.agreed,
    unavailable: false,
    onContinue: continueChallenge
  });
  setStatus(choice === "neither" ? "Challenge response recorded as inconclusive." : answer.agreed ? "Your choice agreed with the snapshot." : "Your choice differed from the snapshot.");
}

function recordUnavailableChallenge(pairId) {
  if (state.stage !== "challenge" || state.currentPair?.id !== pairId) return;
  const pair = state.challengePredictions[state.challengeIndex];
  state.challengeAnswers.push({
    pairId: pair.id,
    leftId: pair.leftId,
    rightId: pair.rightId,
    predictedId: pair.predictedId,
    choice: "unavailable",
    chosenId: "",
    agreed: false
  });
  state.stage = "challengeReveal";
  renderChallengeReveal({
    left: artworkById(pair.leftId),
    right: artworkById(pair.rightId),
    predictionId: pair.predictedId,
    choice: "unavailable",
    agreed: false,
    unavailable: true,
    onContinue: continueChallenge
  });
  setStatus("This challenge pair was unavailable and will not count.");
}

function continueChallenge() {
  state.challengeIndex += 1;
  if (state.challengeIndex < config.challengePairCount) {
    showChallengePair();
    return;
  }
  state.stage = "challengeSummary";
  renderChallengeSummary(scoreChallenge(state.challengeAnswers), {
    onRestart: restart,
    onResults: () => {
      state.stage = "results";
      renderResults(state.result, { onRestart: restart, onChallenge: startChallenge });
      setStatus("Your refined taste snapshot is ready.");
    }
  });
  setStatus("The three-pair profile challenge is complete.");
}

function restart() {
  state = createInitialState();
  data = null;
  renderWelcome(startQuiz, { focusHeading: true });
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
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (state.stage === "initial" || state.stage === "adaptive") {
    if (event.key === "ArrowLeft") recordQuizChoice("left");
    if (event.key === "ArrowRight") recordQuizChoice("right");
    if (event.key.toLowerCase() === "n") recordQuizChoice("neither");
  }
  if (state.stage === "challenge") {
    if (event.key === "ArrowLeft") recordChallengeChoice("left");
    if (event.key === "ArrowRight") recordChallengeChoice("right");
    if (event.key.toLowerCase() === "n") recordChallengeChoice("neither");
  }
});

const diagnosticsRequested = new URLSearchParams(window.location.search).get("diagnostics") === "1";
setDiagnosticsVisible(config.featureFlags.diagnostics || diagnosticsRequested);
renderWelcome(startQuiz);
