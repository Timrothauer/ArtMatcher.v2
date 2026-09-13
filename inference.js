export function addVectors(first, second) {
  if (first.length !== second.length) throw new Error("Vector dimensions must match");
  return first.map((value, index) => value + second[index]);
}

export function subtractVectors(first, second) {
  if (first.length !== second.length) throw new Error("Vector dimensions must match");
  return first.map((value, index) => value - second[index]);
}

export function normalizeVector(vector) {
  const length = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (length === 0) return vector.map(() => 0);
  return vector.map((value) => value / length);
}

export function dotProduct(first, second) {
  if (first.length !== second.length) throw new Error("Vector dimensions must match");
  return first.reduce((sum, value, index) => sum + value * second[index], 0);
}

export function cosineSimilarity(first, second) {
  const normalizedFirst = normalizeVector(first);
  const normalizedSecond = normalizeVector(second);
  return dotProduct(normalizedFirst, normalizedSecond);
}

export function contributionForAnswer(answer, embeddings) {
  if (answer.choice === "neither") return [];
  return subtractVectors(embeddings[answer.chosenId], embeddings[answer.rejectedId]);
}

export function preferenceFromAnswers(answers, embeddings) {
  const directional = answers.filter((answer) => answer.choice !== "neither");
  if (directional.length === 0) return [];
  const dimension = embeddings[directional[0].chosenId].length;
  const total = directional.reduce(
    (sum, answer) => addVectors(sum, contributionForAnswer(answer, embeddings)),
    Array(dimension).fill(0)
  );
  return normalizeVector(total);
}

function confidenceFor(answerCount, strength, thresholds) {
  if (answerCount >= thresholds.strongAnswers && strength >= thresholds.strongSignal) return "Strong";
  if (answerCount >= thresholds.moderateAnswers && strength >= thresholds.moderateSignal) return "Moderate";
  return "Emerging";
}

export function summarizeConcepts(answers, artworks, conceptGroups, thresholds) {
  const artworkById = new Map(artworks.map((artwork) => [artwork.id, artwork]));
  const directional = answers.filter((answer) => answer.choice !== "neither");
  return conceptGroups.map((group) => {
    const evidence = directional.map((answer) => {
      const chosen = artworkById.get(answer.chosenId)?.conceptScores ?? {};
      const rejected = artworkById.get(answer.rejectedId)?.conceptScores ?? {};
      const chosenAxis = chosen[group.keys[1]] - chosen[group.keys[0]];
      const rejectedAxis = rejected[group.keys[1]] - rejected[group.keys[0]];
      return chosenAxis - rejectedAxis;
    }).filter(Number.isFinite);
    const average = evidence.length ? evidence.reduce((sum, value) => sum + value, 0) / evidence.length : 0;
    const strength = Math.min(1, Math.abs(average) / 2);
    const favoredIndex = average >= 0 ? 1 : 0;
    return {
      dimension: group.dimension,
      label: group.labels[favoredIndex],
      strength,
      mixed: strength < thresholds.mixedSignal,
      confidence: confidenceFor(evidence.length, strength, thresholds)
    };
  });
}

export function createTasteResult(answers, artworks, embeddings, config) {
  const directional = answers.filter((answer) => answer.choice !== "neither");
  const preferenceVector = preferenceFromAnswers(answers, embeddings);
  const insufficient = directional.length === 0 || preferenceVector.every((value) => value === 0);
  const concepts = summarizeConcepts(answers, artworks, config.conceptGroups, config.signalThresholds);
  const supported = concepts.filter((result) => !result.mixed).sort((a, b) => b.strength - a.strength).slice(0, config.resultLimit);
  const mixed = concepts.filter((result) => result.mixed).sort((a, b) => a.strength - b.strength);
  const artworkById = new Map(artworks.map((artwork) => [artwork.id, artwork]));
  const representativeChoices = directional.slice(0, config.representativeChoiceLimit).map((answer) => ({
    pairId: answer.pairId,
    chosen: artworkById.get(answer.chosenId),
    rejected: artworkById.get(answer.rejectedId)
  }));

  return {
    insufficient,
    directionalCount: directional.length,
    neitherCount: answers.length - directional.length,
    preferenceVector,
    supported,
    mixed,
    representativeChoices
  };
}

export function createInitialState() {
  return {
    stage: "welcome",
    initialIndex: 0,
    answers: [],
    preferenceVector: [],
    result: null
  };
}
