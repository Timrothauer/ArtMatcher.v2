import test from "node:test";
import assert from "node:assert/strict";
import { config } from "../config.js";
import {
  addVectors,
  chooseProfileName,
  confidenceLabel,
  cosineSimilarity,
  contributionForAnswer,
  createChallenge,
  createInitialState,
  normalizeVector,
  pairKey,
  preferenceFromAnswers,
  rankRecommendations,
  scoreChallenge,
  selectAdaptivePair,
  subtractVectors,
  summarizeFactualTendencies
} from "../inference.js";

test("adds and subtracts inspectable vectors", () => {
  assert.deepEqual(addVectors([1, 2], [3, 4]), [4, 6]);
  assert.deepEqual(subtractVectors([3, 4], [1, 2]), [2, 2]);
});

test("normalizes a vector and leaves a zero vector safe", () => {
  assert.deepEqual(normalizeVector([3, 4]), [0.6, 0.8]);
  assert.deepEqual(normalizeVector([0, 0]), [0, 0]);
});

test("cosine similarity compares direction", () => {
  assert.equal(cosineSimilarity([1, 0], [1, 0]), 1);
  assert.equal(cosineSimilarity([1, 0], [-1, 0]), -1);
});

test("directional answers subtract rejected from chosen", () => {
  const embeddings = { a: [1, 0], b: [0, 1] };
  assert.deepEqual(contributionForAnswer({ choice: "left", chosenId: "a", rejectedId: "b" }, embeddings), [1, -1]);
});

test("Neither / Unsure contributes no direction", () => {
  const embeddings = { a: [1, 0], b: [0, 1] };
  assert.deepEqual(contributionForAnswer({ choice: "neither", chosenId: "", rejectedId: "" }, embeddings), []);
  assert.deepEqual(preferenceFromAnswers([{ choice: "neither" }], embeddings), []);
});

test("different answer patterns yield different preference directions", () => {
  const embeddings = { a: [1, 0], b: [0, 1] };
  const left = preferenceFromAnswers([{ choice: "left", chosenId: "a", rejectedId: "b" }], embeddings);
  const right = preferenceFromAnswers([{ choice: "right", chosenId: "b", rejectedId: "a" }], embeddings);
  assert.ok(cosineSimilarity(left, right) < -0.99);
});

test("canonical unordered pair keys ignore display order", () => {
  assert.equal(pairKey("b", "a"), "a::b");
  assert.equal(pairKey("a", "b"), pairKey("b", "a"));
});

function artwork(id, quizRole = "quiz", extra = {}) {
  return {
    id,
    quizRole,
    medium: "Oil on canvas",
    yearStart: 1900,
    cultureOrRegion: "Test region",
    conceptScores: {
      abstract: 0.8, figurative: 0.2,
      minimal: 0.7, visuallyDense: 0.3,
      geometric: 0.6, organic: 0.4,
      restrainedColor: 0.7, saturatedColor: 0.3,
      calm: 0.7, dramatic: 0.3,
      traditional: 0.4, experimental: 0.6
    },
    ...extra
  };
}

test("adaptive selection is deterministic and excludes shown pairs and non-quiz roles", () => {
  const artworks = [artwork("q1"), artwork("q2"), artwork("q3"), artwork("rec", "recommendation"), artwork("hold", "holdout")];
  const embeddings = { q1: [1, 0], q2: [0, 1], q3: [-1, 0], rec: [0, -1], hold: [0.7, 0.7] };
  const options = { artworks, embeddings, preferenceVector: [], answers: [], shownPairKeys: [pairKey("q1", "q2")], displayCounts: {}, config };
  const first = selectAdaptivePair(options);
  const second = selectAdaptivePair(options);
  assert.deepEqual(first, second);
  assert.notEqual(first.key, pairKey("q1", "q2"));
  assert.ok(first.leftId.startsWith("q") && first.rightId.startsWith("q"));
});

test("adaptive selection respects the artwork exposure cap when alternatives exist", () => {
  const artworks = [artwork("q1"), artwork("q2"), artwork("q3"), artwork("q4")];
  const embeddings = { q1: [1, 0], q2: [0, 1], q3: [-1, 0], q4: [0, -1] };
  const selected = selectAdaptivePair({
    artworks,
    embeddings,
    preferenceVector: [1, 0],
    answers: [],
    shownPairKeys: [],
    displayCounts: { q1: config.artworkExposureCap },
    config
  });
  assert.ok(selected);
  assert.notEqual(selected.leftId, "q1");
  assert.notEqual(selected.rightId, "q1");
});

test("confidence mapping has only Emerging, Moderate, and Strong labels", () => {
  assert.equal(confidenceLabel(0.1, config.confidenceThresholds), "Emerging");
  assert.equal(confidenceLabel(0.5, config.confidenceThresholds), "Moderate");
  assert.equal(confidenceLabel(0.8, config.confidenceThresholds), "Strong");
});

test("missing factual metadata is neutral", () => {
  const works = [artwork("a", "quiz", { medium: "", yearStart: null, cultureOrRegion: "" }), artwork("b", "quiz", { medium: "", yearStart: null, cultureOrRegion: "" })];
  const answers = [{ choice: "left", chosenId: "a", rejectedId: "b" }];
  assert.deepEqual(summarizeFactualTendencies(answers, works, config), []);
});

test("controlled profile mapping uses a documented rule and mixed fallback", () => {
  const attributes = [
    { dimension: "Color", label: "Saturated color", strength: 0.8, confidence: "Strong", mixed: false },
    { dimension: "Approach", label: "Experimental", strength: 0.7, confidence: "Moderate", mixed: false }
  ];
  assert.equal(chooseProfileName(attributes, config).name, "The Chromatic Experimentalist");
  assert.equal(chooseProfileName([{ ...attributes[0], confidence: "Emerging" }], config).name, "The Eclectic Explorer");
});

test("recommendations filter by role and break score ties by stable ID", () => {
  const works = [artwork("quiz", "quiz"), artwork("rec-b", "recommendation"), artwork("rec-a", "recommendation"), artwork("hold", "holdout")];
  const embeddings = { quiz: [1, 0], "rec-a": [1, 0], "rec-b": [1, 0], hold: [1, 0] };
  const ranked = rankRecommendations(works, embeddings, [1, 0], [], [], config);
  assert.deepEqual(ranked.map((item) => item.artwork.id), ["rec-a", "rec-b"]);
});

test("challenge freezes the vector and uses exactly six holdout works", () => {
  const works = Array.from({ length: 6 }, (_, index) => artwork(`h${index + 1}`, "holdout"));
  const embeddings = Object.fromEntries(works.map((work, index) => [work.id, normalizeVector([index + 1, 1])]));
  const preference = [1, 0];
  const challenge = createChallenge(works, embeddings, preference, 3);
  preference[0] = 0;
  assert.deepEqual(challenge.frozenVector, [1, 0]);
  assert.equal(challenge.pairs.length, 3);
  assert.equal(new Set(challenge.pairs.flatMap((pair) => [pair.leftId, pair.rightId])).size, 6);
});

test("challenge scoring separates agreement, directional, inconclusive, and unavailable trials", () => {
  assert.deepEqual(scoreChallenge([
    { choice: "left", agreed: true },
    { choice: "right", agreed: false },
    { choice: "neither", agreed: false },
    { choice: "unavailable", agreed: false }
  ]), { agreements: 1, directionalTrials: 2, inconclusiveTrials: 1, unavailableTrials: 1 });
});

test("restart state clears every Phase 2 field and returns independent collections", () => {
  const state = createInitialState();
  state.answers.push({ choice: "left" });
  state.challengeAnswers.push({ choice: "right" });
  assert.deepEqual(createInitialState(), {
    stage: "welcome",
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
  });
});
