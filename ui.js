const controlsRegion = document.querySelector("#controls-region");
const statusLine = document.querySelector("#status-line");
const viewRegion = document.querySelector("#view-region");

function replaceView(node) {
  viewRegion.replaceChildren(node);
}

function makeMessage(kind, title, message) {
  const panel = document.createElement("section");
  const heading = document.createElement("h3");
  const copy = document.createElement("p");

  panel.className = `message message--${kind}`;
  heading.textContent = title;
  copy.textContent = message;
  panel.append(heading, copy);
  return panel;
}

export function setBusy(isBusy) {
  viewRegion.setAttribute("aria-busy", String(isBusy));
  controlsRegion.querySelectorAll("button").forEach((button) => {
    button.disabled = isBusy;
  });

  if (isBusy) {
    replaceView(makeMessage("busy", "Preparing the preview", "Loading the hand-written sample collection…"));
  }
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
  const list = document.createElement("ul");
  list.className = "sample-grid";

  items.forEach((item, index) => {
    const entry = document.createElement("li");
    const number = document.createElement("span");
    const title = document.createElement("h3");
    const description = document.createElement("p");

    number.className = "sample-number";
    number.textContent = String(index + 1).padStart(2, "0");
    title.textContent = item.title;
    description.textContent = item.description;
    entry.append(number, title, description);
    list.append(entry);
  });

  replaceView(list);
}

export function clearResults() {
  viewRegion.replaceChildren();
}
