(function () {
  try {
    var root = document.documentElement;
    var viewRegion = document.getElementById("view-region");
    root.classList.add("js");

    function decorateMovementSummary() {
      var summary = document.querySelector(".results-view .result-summary");
      if (!summary || summary.dataset.styleEmphasis === "true") return;

      var summaryText = summary.textContent || "";
      var preferredStart = summaryText.lastIndexOf("Within this catalog,");
      var fallbackStart = summaryText.lastIndexOf("No single movement or style");
      var sentenceStart = Math.max(preferredStart, fallbackStart);
      if (sentenceStart < 0) return;

      var emphasis = document.createElement("span");
      emphasis.className = "movement-summary";
      emphasis.textContent = summaryText.slice(sentenceStart);
      summary.replaceChildren(document.createTextNode(summaryText.slice(0, sentenceStart)), emphasis);
      summary.dataset.styleEmphasis = "true";
    }

    if (viewRegion) {
      new MutationObserver(function () {
        try {
          decorateMovementSummary();
        } catch (error) {
          root.classList.remove("js");
          console.warn("Visual emphasis disabled:", error);
        }
      }).observe(viewRegion, { childList: true, subtree: true });
    }

    decorateMovementSummary();

    window.setTimeout(function () {
      root.classList.add("motion-settled");
    }, 3000);
  } catch (error) {
    document.documentElement.classList.remove("js");
    document.documentElement.classList.add("motion-settled");
    console.warn("Motion disabled:", error);
  }
})();
