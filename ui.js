const controlsRegion = document.querySelector("#controls-region");
const statusLine = document.querySelector("#status-line");
const viewRegion = document.querySelector("#view-region");

function replaceView(node) {
  viewRegion.replaceChildren(node);
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

function artworkImage(artwork, alt, className = "artwork-image") {
  const image = document.createElement("img");
  image.className = className;
  image.src = artwork.imagePath;
  image.alt = alt;
  image.loading = "eager";
  image.decoding = "async";
  image.addEventListener("error", () => {
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
    element("p", "eyebrow", "Eight visual choices · About three minutes"),
    element("h2", "welcome-title", "Which images stay with you?"),
    element("p", "welcome-copy", "Choose between artworks and receive a cautious snapshot of the visual qualities you seem drawn to. No art-history knowledge is needed."),
    makeButton("Discover My Taste", "primary-action discover-action", onStart),
    element("p", "experiment-note", "This is an experimental taste snapshot, not a psychological assessment or permanent description of you.")
  );
  replaceView(welcome);
}

function comparisonOption(artwork, side, onChoose) {
  const button = element("button", "artwork-option");
  button.type = "button";
  button.setAttribute("aria-label", `Choose artwork on the ${side}`);
  button.append(
    artworkImage(artwork, `Artwork option on the ${side}`),
    element("span", "choose-label", `Choose ${side}`)
  );
  button.addEventListener("click", () => onChoose(side));
  return button;
}

export function renderComparison({ left, right, index, total, onChoose }) {
  document.body.dataset.stage = "quiz";
  const view = element("section", "quiz-view");
  const heading = element("div", "quiz-heading");
  heading.append(
    element("p", "progress-label", `Comparison ${index + 1} of ${total}`),
    element("h2", "question", "Which work are you more drawn to?"),
    element("p", "keyboard-hint", "Use the buttons, ← or →. Press N for Neither / Unsure.")
  );
  const pair = element("div", "comparison-grid");
  pair.append(comparisonOption(left, "left", onChoose), comparisonOption(right, "right", onChoose));
  const neither = makeButton("Neither / Unsure", "neither-action", () => onChoose("neither"));
  view.append(heading, pair, neither);
  replaceView(view);
  view.querySelector(".artwork-option")?.focus();
}

function revealedArtwork(artwork, selectedLabel) {
  const card = element("article", "reveal-card");
  if (selectedLabel) card.append(element("p", "choice-marker", selectedLabel));
  card.append(artworkImage(artwork, artwork.imageAlt), artworkFacts(artwork));
  return card;
}

export function renderReveal({ left, right, choice, onContinue }) {
  document.body.dataset.stage = "reveal";
  const view = element("section", "reveal-view");
  view.append(element("p", "eyebrow", choice === "neither" ? "No direction added" : "Choice recorded"));
  view.append(element("h2", "reveal-title", "The works you just saw"));
  const cards = element("div", "reveal-grid");
  cards.append(
    revealedArtwork(left, choice === "left" ? "Your choice" : ""),
    revealedArtwork(right, choice === "right" ? "Your choice" : "")
  );
  view.append(cards, makeButton("Continue", "primary-action continue-action", onContinue));
  replaceView(view);
  view.querySelector(".continue-action")?.focus();
}

function confidenceDescription(signal) {
  if (signal.confidence === "Strong") return "Repeated choices point in the same direction.";
  if (signal.confidence === "Moderate") return "Several choices support this direction.";
  return "This is an early signal from limited or varied evidence.";
}

function resultArtwork(artwork, label) {
  const card = element("article", "result-artwork");
  card.append(element("p", "choice-marker", label), artworkImage(artwork, artwork.imageAlt), artworkFacts(artwork));
  return card;
}

export function renderResults(result, onRestart) {
  document.body.dataset.stage = "results";
  const view = element("section", "results-view");
  view.append(element("p", "eyebrow", "Your first taste snapshot"));

  if (result.insufficient) {
    view.append(
      element("h2", "result-title", "There isn’t enough directional evidence yet."),
      element("p", "result-summary", "You chose Neither / Unsure throughout, so the profile has no responsible basis for claiming a preference. That is a valid result—your reactions may need different examples."),
      makeButton("Start Over", "primary-action", onRestart)
    );
    replaceView(view);
    return;
  }

  const leading = result.supported.slice(0, 2).map((signal) => signal.label.toLowerCase());
  const summary = leading.length
    ? `Your choices suggest a pull toward ${leading.join(" and ")}. This is an emerging interpretation of eight comparisons, not a fixed account of your taste.`
    : "Your directional choices are varied, so no single visual tendency dominates yet. This mixed result is a useful starting point rather than a fixed account of your taste.";
  view.append(
    element("h2", "result-title", "Patterns are beginning to emerge."),
    element("p", "result-summary", summary),
    element("p", "evidence-count", `${result.directionalCount} directional choices · ${result.neitherCount} inconclusive`)
  );

  const signalSection = element("section", "result-section");
  signalSection.append(element("h3", "section-title", "Strongest supported affinities"));
  const signalList = element("div", "signal-list");
  if (result.supported.length === 0) {
    signalList.append(element("p", "mixed-copy", "No visual direction is supported strongly enough yet."));
  } else {
    result.supported.forEach((signal) => {
      const item = element("article", "signal-card");
      item.append(
        element("p", "signal-dimension", signal.dimension),
        element("h4", "signal-label", signal.label),
        element("p", "confidence-label", signal.confidence),
        element("p", "signal-explanation", confidenceDescription(signal))
      );
      signalList.append(item);
    });
  }
  signalSection.append(signalList);
  view.append(signalSection);

  const mixedSection = element("section", "result-section mixed-section");
  mixedSection.append(
    element("h3", "section-title", "Mixed or uncertain evidence"),
    element("p", "mixed-copy", result.mixed.length
      ? `The evidence is mixed for ${result.mixed.map((signal) => signal.dimension.toLowerCase()).join(", ")}. More varied comparisons may clarify these dimensions.`
      : "No major dimension is currently marked as mixed, though this remains a small sample.")
  );
  view.append(mixedSection);

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

  view.append(makeButton("Start Over", "primary-action restart-action", onRestart));
  replaceView(view);
}
