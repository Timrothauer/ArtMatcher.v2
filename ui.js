const controlsRegion = document.querySelector("#controls-region");
const statusLine = document.querySelector("#status-line");
const viewRegion = document.querySelector("#view-region");

function replaceView(node) {
  viewRegion.replaceChildren(node);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function makeButton(label, className, onClick) {
  const button = element("button", className, label);
  button.type = "button";
  button.addEventListener("click", onClick);
  return button;
}

function makeMessage(kind, title, message) {
  const panel = element("section", `message message--${kind}`);
  panel.append(element("h2", "", title), element("p", "", message));
  return panel;
}

function artworkImage(artwork, alt, className = "artwork-image", onError = null) {
  const image = document.createElement("img");
  image.className = className;
  image.src = artwork.imagePath;
  image.alt = alt;
  image.loading = className.includes("result") ? "lazy" : "eager";
  image.decoding = "async";
  image.addEventListener("error", () => {
    if (onError) onError(artwork.id);
    image.replaceWith(element("p", "image-fallback", "This artwork image could not be displayed."));
  }, { once: true });
  return image;
}

function artworkFacts(artwork) {
  const facts = element("div", "artwork-facts");
  facts.append(element("h3", "", artwork.title));
  const creator = artwork.artist || "Creator not recorded";
  const date = artwork.yearLabel || "Date not recorded";
  facts.append(element("p", "artwork-credit", `${creator} · ${date}`));
  if (artwork.medium) facts.append(element("p", "artwork-medium", artwork.medium));
  const sourceLink = element("a", "source-link", `View at ${artwork.source}`);
  sourceLink.href = artwork.sourceUrl;
  sourceLink.target = "_blank";
  sourceLink.rel = "noreferrer";
  facts.append(sourceLink);
  return facts;
}

export function setBusy(isBusy) {
  viewRegion.setAttribute("aria-busy", String(isBusy));
  document.querySelectorAll("button").forEach((button) => {
    button.disabled = isBusy;
  });
  if (isBusy) replaceView(makeMessage("busy", "Preparing your view", "Loading the prepared local collection…"));
}

export function setStatus(message) {
  statusLine.textContent = message;
  statusLine.className = "status";
}

export function showError(message) {
  statusLine.className = "status status--error";
  replaceView(makeMessage("error", "Something went wrong", message));
}

export function showEmpty(message) {
  replaceView(makeMessage("empty", "Nothing to show yet", message));
}

export function renderList(items) {
  document.body.dataset.stage = "foundation";
  const list = element("ul", "sample-grid");
  items.forEach((item, index) => {
    const entry = element("li", "");
    entry.append(
      element("span", "sample-number", String(index + 1).padStart(2, "0")),
      element("h3", "", item.title),
      element("p", "", item.description)
    );
    list.append(entry);
  });
  replaceView(list);
}

export function clearResults() {
  viewRegion.replaceChildren();
}

export function renderWelcome(onStart) {
  document.body.dataset.stage = "welcome";
  const welcome = element("section", "welcome-view");
  welcome.append(
    element("p", "eyebrow", "Eight opening choices · Six focused follow-ups"),
    element("h2", "welcome-title", "Which images stay with you?"),
    element("p", "welcome-copy", "Choose between artworks and receive a cautious snapshot of the visual qualities you seem drawn to. No art-history knowledge is needed."),
    makeButton("Discover My Taste", "primary-action discover-action", onStart),
    element("p", "experiment-note", "This is an experimental taste snapshot, not a psychological assessment or permanent description of you.")
  );
  replaceView(welcome);
}

function comparisonOption(artwork, side, onChoose, onImageError, context = "artwork") {
  const button = element("button", "artwork-option");
  button.type = "button";
  button.setAttribute("aria-label", `Choose ${context} on the ${side}`);
  button.append(
    artworkImage(artwork, `${context[0].toUpperCase()}${context.slice(1)} option on the ${side}`, "artwork-image", onImageError),
    element("span", "choose-label", `Choose ${side}`)
  );
  button.addEventListener("click", () => onChoose(side));
  return button;
}

export function renderComparison({ left, right, index, total, round, onChoose, onFinish, onImageError }) {
  document.body.dataset.stage = round === "Refinement" ? "adaptive" : "quiz";
  const view = element("section", "quiz-view");
  const heading = element("div", "quiz-heading");
  heading.append(
    element("p", "progress-label", `${round} ${index + 1} of ${total}`),
    element("h2", "question", "Which work are you more drawn to?"),
    element("p", "keyboard-hint", "Use the buttons, ← or →. Press N for Neither / Unsure.")
  );
  if (round === "Refinement") heading.append(element("p", "refinement-note", "This pair was chosen to investigate uncertainty in your current snapshot."));
  const pair = element("div", "comparison-grid");
  pair.append(
    comparisonOption(left, "left", onChoose, onImageError),
    comparisonOption(right, "right", onChoose, onImageError)
  );
  const actions = element("div", "comparison-actions");
  actions.append(makeButton("Neither / Unsure", "neither-action", () => onChoose("neither")));
  if (onFinish) actions.append(makeButton("Finish Now", "text-action finish-action", onFinish));
  view.append(heading, pair, actions);
  replaceView(view);
  view.querySelector(".artwork-option")?.focus();
}

export function renderRefinementIntro(onContinue) {
  document.body.dataset.stage = "adaptive";
  const view = element("section", "refinement-intro");
  view.append(
    element("p", "eyebrow", "Opening round complete"),
    element("h2", "reveal-title", "Now let’s sharpen the picture."),
    element("p", "welcome-copy", "The next comparisons focus on places where your choices leave room for more than one interpretation. Answer at least three, or continue through all six for broader evidence."),
    makeButton("Begin Refinement", "primary-action refinement-action", onContinue)
  );
  replaceView(view);
  view.querySelector(".refinement-action")?.focus();
}

function revealedArtwork(artwork, markers = []) {
  const card = element("article", "reveal-card");
  markers.filter(Boolean).forEach((marker) => card.append(element("p", "choice-marker", marker)));
  card.append(artworkImage(artwork, artwork.imageAlt), artworkFacts(artwork));
  return card;
}

export function renderReveal({ left, right, choice, round, onContinue, onFinish }) {
  document.body.dataset.stage = "reveal";
  const view = element("section", "reveal-view");
  view.append(element("p", "eyebrow", choice === "neither" ? "No direction added" : round === "adaptive" ? "Refinement recorded" : "Choice recorded"));
  view.append(element("h2", "reveal-title", "The works you just saw"));
  const cards = element("div", "reveal-grid");
  cards.append(
    revealedArtwork(left, [choice === "left" ? "Your choice" : ""]),
    revealedArtwork(right, [choice === "right" ? "Your choice" : ""])
  );
  const actions = element("div", "reveal-actions");
  actions.append(makeButton("Continue", "primary-action continue-action", onContinue));
  if (onFinish) actions.append(makeButton("Finish Now", "secondary-action finish-action", onFinish));
  view.append(cards, actions);
  replaceView(view);
  view.querySelector(".continue-action")?.focus();
}

function confidenceDescription(signal) {
  const support = signal.supportingChoiceIds.length;
  const contradiction = signal.contradictingChoiceIds.length;
  if (signal.mixed) return `Evidence split across ${signal.evidenceCount} directional choices; no direction is forced.`;
  return `${support} choice${support === 1 ? "" : "s"} supported this direction; ${contradiction} pointed the other way.`;
}

function resultArtwork(artwork, label) {
  const card = element("article", "result-artwork");
  card.append(element("p", "choice-marker", label), artworkImage(artwork, artwork.imageAlt, "artwork-image result-image"), artworkFacts(artwork));
  return card;
}

function renderScorecard(attributeResults) {
  const section = element("section", "result-section scorecard-section");
  section.append(
    element("p", "section-kicker", "Prepared visual signals + your recorded choices"),
    element("h3", "section-title", "Attribute scorecard")
  );
  const list = element("div", "scorecard");
  attributeResults.forEach((signal) => {
    const item = element("article", `score-row${signal.mixed ? " score-row--mixed" : ""}`);
    const heading = element("div", "score-heading");
    heading.append(element("h4", "score-dimension", signal.dimension), element("span", "confidence-label", signal.mixed ? "Unclear" : signal.confidence));
    const leftLabel = signal.position <= 50 ? signal.label : signal.oppositeLabel;
    const rightLabel = signal.position <= 50 ? signal.oppositeLabel : signal.label;
    const labels = element("div", "scale-labels");
    labels.append(element("span", "", leftLabel), element("span", "", rightLabel));
    const scale = element("div", "attribute-scale");
    scale.setAttribute("role", "img");
    scale.setAttribute("aria-label", signal.mixed
      ? `${signal.dimension}: evidence is unclear between ${leftLabel} and ${rightLabel}`
      : `${signal.dimension}: leans ${signal.label}, with ${signal.confidence.toLowerCase()} confidence`);
    const marker = element("span", "scale-marker");
    marker.style.left = `${signal.position}%`;
    scale.append(marker);
    item.append(heading, labels, scale, element("p", "score-evidence", confidenceDescription(signal)));
    list.append(item);
  });
  section.append(list);
  return section;
}

function renderSignalSection(result) {
  const section = element("section", "result-section");
  section.append(element("h3", "section-title", "Strongest supported affinities"));
  const list = element("div", "signal-list");
  if (!result.supported.length) list.append(element("p", "mixed-copy", "No visual direction is supported strongly enough yet."));
  result.supported.forEach((signal) => {
    const item = element("article", "signal-card");
    item.append(
      element("p", "signal-dimension", signal.dimension),
      element("h4", "signal-label", signal.label),
      element("p", "confidence-label", signal.confidence),
      element("p", "signal-explanation", confidenceDescription(signal))
    );
    list.append(item);
  });
  section.append(list);
  return section;
}

function renderFactualSection(tendencies) {
  const section = element("section", "result-section factual-section");
  section.append(element("h3", "section-title", "Factual clues in the works you saw"));
  if (!tendencies.length) {
    section.append(element("p", "mixed-copy", "No medium, period, or culture field appeared often enough to support a responsible factual tendency."));
    return section;
  }
  const list = element("ul", "factual-list");
  tendencies.forEach((item) => {
    const direction = item.direction === "favored" ? "appeared more often among selected works" : "appeared more often among works not selected";
    const entry = element("li", "");
    entry.append(element("strong", "", `${item.dimension}: ${item.value}`), element("span", "", `${direction} across ${item.exposure} exposures · ${item.confidence}`));
    list.append(entry);
  });
  section.append(list);
  return section;
}

function renderRecommendations(recommendations) {
  const section = element("section", "result-section recommendation-section");
  section.append(
    element("p", "section-kicker", "Unseen works from the recommendation pool"),
    element("h3", "section-title", "You May Also Like")
  );
  const grid = element("div", "recommendation-grid");
  recommendations.forEach((recommendation, index) => {
    const card = element("article", "recommendation-card");
    card.append(
      element("p", "recommendation-rank", String(index + 1).padStart(2, "0")),
      artworkImage(recommendation.artwork, recommendation.artwork.imageAlt, "artwork-image result-image"),
      artworkFacts(recommendation.artwork),
      element("p", "recommendation-reason", recommendation.explanation)
    );
    grid.append(card);
  });
  section.append(grid);
  return section;
}

export function renderResults(result, { onRestart, onChallenge }) {
  document.body.dataset.stage = "results";
  const view = element("section", "results-view");
  view.append(element("p", "eyebrow", "Your refined taste snapshot"));

  if (result.insufficient) {
    view.append(
      element("h2", "result-title", "There isn’t enough directional evidence yet."),
      element("p", "result-summary", "You chose Neither / Unsure throughout, so the profile has no responsible basis for claiming a preference. That is a valid result—different examples may produce a clearer direction."),
      makeButton("Start Over", "primary-action restart-action", onRestart)
    );
    replaceView(view);
    return;
  }

  const leading = result.profileAttributes.map((signal) => signal.label.toLowerCase());
  const summary = leading.length >= 2
    ? `Your choices suggest a pull toward ${leading.join(" and ")}. The profile combines ${result.directionalCount} directional choices with their consistency and visual coverage; it remains an exploratory snapshot, not a fixed account of your taste.`
    : "Your choices point in several directions, so the profile remains intentionally broad. Mixed evidence is part of the result rather than something the snapshot tries to hide.";
  view.append(
    element("h2", "profile-name", result.profileName),
    element("p", "profile-support", leading.length ? `${result.profileAttributes.map((item) => `${item.label} · ${item.confidence}`).join("  /  ")}  /  Overall ${result.overallConfidence.label}` : `Mixed visual evidence  /  Overall ${result.overallConfidence.label}`),
    element("p", "result-summary", summary),
    element("p", "evidence-count", `${result.directionalCount} directional choices · ${result.neitherCount} inconclusive`)
  );

  view.append(renderScorecard(result.attributeResults), renderSignalSection(result));

  const mixedSection = element("section", "result-section mixed-section");
  mixedSection.append(
    element("h3", "section-title", "Mixed or uncertain evidence"),
    element("p", "mixed-copy", result.mixed.length
      ? `The evidence is mixed for ${result.mixed.map((signal) => signal.dimension.toLowerCase()).join(", ")}. The scorecard leaves these dimensions unclear rather than forcing a label.`
      : "No major dimension is currently marked as mixed, though this remains a small and bounded sample.")
  );
  view.append(mixedSection, renderFactualSection(result.factualTendencies));

  if (result.representativeChoices.length) {
    const choices = element("section", "result-section");
    choices.append(element("h3", "section-title", "Representative choices"));
    result.representativeChoices.forEach((choice) => {
      const pair = element("div", "result-choice-pair");
      pair.append(resultArtwork(choice.chosen, "Chosen"), resultArtwork(choice.rejected, "Not chosen"));
      choices.append(pair);
    });
    view.append(choices);
  }

  if (result.recommendations.length) view.append(renderRecommendations(result.recommendations));

  const actions = element("div", "result-actions");
  actions.append(
    makeButton("Test My Profile", "primary-action challenge-action", onChallenge),
    makeButton("Start Over", "secondary-action restart-action", onRestart)
  );
  view.append(actions);
  replaceView(view);
}

export function renderChallengeComparison({ left, right, index, total, onChoose, onImageError }) {
  document.body.dataset.stage = "challenge";
  const view = element("section", "challenge-view");
  view.append(
    element("p", "progress-label", `Profile challenge ${index + 1} of ${total}`),
    element("h2", "question", "Which held-out work would you choose?"),
    element("p", "challenge-intro", "Your snapshot has already recorded a prediction. Choose before it is revealed.")
  );
  const grid = element("div", "comparison-grid");
  grid.append(
    comparisonOption(left, "left", onChoose, onImageError, "held-out artwork"),
    comparisonOption(right, "right", onChoose, onImageError, "held-out artwork")
  );
  view.append(grid, makeButton("Neither / Unsure", "neither-action", () => onChoose("neither")));
  replaceView(view);
  view.querySelector(".artwork-option")?.focus();
}

export function renderChallengeReveal({ left, right, predictionId, choice, agreed, unavailable, onContinue }) {
  document.body.dataset.stage = "challenge-reveal";
  const view = element("section", "challenge-view reveal-view");
  let resultCopy = agreed ? "Your choice agreed with the snapshot’s recorded prediction." : "Your choice differed from the snapshot’s recorded prediction.";
  if (choice === "neither") resultCopy = "This response is inconclusive and will not count as an agreement or disagreement.";
  if (unavailable) resultCopy = "An image in this pair was unavailable, so this trial will not count.";
  view.append(element("p", "eyebrow", "Prediction revealed"), element("h2", "reveal-title", resultCopy));
  const grid = element("div", "reveal-grid");
  grid.append(
    revealedArtwork(left, [predictionId === left.id ? "Snapshot predicted" : "", choice === "left" ? "Your choice" : ""]),
    revealedArtwork(right, [predictionId === right.id ? "Snapshot predicted" : "", choice === "right" ? "Your choice" : ""])
  );
  view.append(grid, makeButton("Continue", "primary-action continue-action", onContinue));
  replaceView(view);
  view.querySelector(".continue-action")?.focus();
}

export function renderChallengeSummary(summary, { onRestart, onResults }) {
  document.body.dataset.stage = "challenge-summary";
  const view = element("section", "challenge-summary");
  view.append(
    element("p", "eyebrow", "Profile challenge complete"),
    element("h2", "result-title", `${summary.agreements} of ${summary.directionalTrials} directional choices agreed.`)
  );
  const counts = element("dl", "challenge-counts");
  [
    ["Agreements", summary.agreements],
    ["Directional trials", summary.directionalTrials],
    ["Inconclusive", summary.inconclusiveTrials],
    ["Unavailable", summary.unavailableTrials]
  ].forEach(([label, value]) => {
    const group = element("div", "challenge-count");
    group.append(element("dt", "", label), element("dd", "", String(value)));
    counts.append(group);
  });
  view.append(
    counts,
    element("p", "challenge-caveat", "This three-pair challenge is a playful check of the current snapshot, not a scientific accuracy test.")
  );
  const actions = element("div", "result-actions");
  actions.append(makeButton("Back to Results", "primary-action", onResults), makeButton("Start Over", "secondary-action", onRestart));
  view.append(actions);
  replaceView(view);
}
