import test from "node:test";
import assert from "node:assert/strict";
import {
  addVectors,
  cosineSimilarity,
  contributionForAnswer,
  createInitialState,
  normalizeVector,
  preferenceFromAnswers,
  subtractVectors
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
  const answer = { choice: "left", chosenId: "a", rejectedId: "b" };
  assert.deepEqual(contributionForAnswer(answer, embeddings), [1, -1]);
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

test("restart state is complete and independent", () => {
  const state = createInitialState();
  state.answers.push({ choice: "left" });
  assert.deepEqual(createInitialState(), {
    stage: "welcome",
    initialIndex: 0,
    answers: [],
    preferenceVector: [],
    result: null
  });
});
