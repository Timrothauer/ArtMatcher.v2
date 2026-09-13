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
  if (!Number.isFinite(length) || length === 0) return vector.map(() => 0);
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

export function pairKey(firstId, secondId) {
  return [firstId, secondId].sort().join("::");
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

export function periodBand(yearStart) {
  if (!Number.isFinite(yearStart)) return "";
  if (yearStart < 1400) return "Before 1400";
  if (yearStart < 1800) return "1400–1799";
  if (yearStart < 1945) return "1800–1944";
  return "1945–present";
}

export function mediumGroup(medium) {
  if (!medium) return "";
  if (/paint|oil|tempera|watercolor/i.test(medium)) return "Painting";
  if (/photo|albumen|gelatin silver/i.test(medium)) return "Photography";
  if (/sculpt|bronze|terracotta|marble|wood|ivory/i.test(medium)) return "Sculpture";
  if (/print|etch|lithograph|woodblock|engraving/i.test(medium)) return "Print or work on paper";
  if (/textile|tapestry|silk|wool/i.test(medium)) return "Textile";
  return "Decorative art or design object";
}

function clamp(value, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function artworkScore(preferenceVector, embedding) {
  if (!preferenceVector.length || preferenceVector.length !== embedding?.length) return 0;
  return dotProduct(preferenceVector, embedding);
}

function conceptAxis(artwork, group) {
  const first = artwork.conceptScores?.[group.keys[0]];
  const second = artwork.conceptScores?.[group.keys[1]];
  return Number.isFinite(first) && Number.isFinite(second) ? second - first : null;
}

function displayedArtworks(artworks, displayCounts) {
  return artworks.filter((artwork) => (displayCounts[artwork.id] ?? 0) > 0);
}

function metadataNovelty(artwork, displayed) {
  const comparisons = [
    [mediumGroup(artwork.medium), (item) => mediumGroup(item.medium)],
    [periodBand(artwork.yearStart), (item) => periodBand(item.yearStart)],
    [artwork.cultureOrRegion || "", (item) => item.cultureOrRegion || ""],
    [artwork.movementOrStyle || "", (item) => item.movementOrStyle || ""]
  ];
  const valid = comparisons.filter(([value]) => value);
  if (!valid.length) return 0;
  const novel = valid.filter(([value, selector]) => !displayed.some((item) => selector(item) === value)).length;
  return novel / valid.length;
}

function testedConceptContrast(answers, artworkById, group) {
  return answers.reduce((sum, answer) => {
    const leftAxis = conceptAxis(artworkById.get(answer.leftId) ?? {}, group);
    const rightAxis = conceptAxis(artworkById.get(answer.rightId) ?? {}, group);
    return sum + (Number.isFinite(leftAxis) && Number.isFinite(rightAxis) ? Math.abs(leftAxis - rightAxis) : 0);
  }, 0);
}

function underTestedConceptScore(first, second, answers, artworkById, conceptGroups) {
  const scores = conceptGroups.map((group) => {
    const firstAxis = conceptAxis(first, group);
    const secondAxis = conceptAxis(second, group);
    if (!Number.isFinite(firstAxis) || !Number.isFinite(secondAxis)) return 0;
    const contrast = Math.abs(firstAxis - secondAxis) / 2;
    const prior = testedConceptContrast(answers, artworkById, group);
    return contrast / (1 + prior);
  });
  return scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : 0;
}

export function selectAdaptivePair({ artworks, embeddings, preferenceVector, answers, shownPairKeys, displayCounts, config, excludedIds = [] }) {
  const quiz = artworks.filter((artwork) => artwork.quizRole === "quiz" && !excludedIds.includes(artwork.id));
  const shown = new Set(shownPairKeys);
  const artworkById = new Map(artworks.map((artwork) => [artwork.id, artwork]));
  const displayed = displayedArtworks(artworks, displayCounts);
  const candidates = [];

  for (let firstIndex = 0; firstIndex < quiz.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < quiz.length; secondIndex += 1) {
      const first = quiz[firstIndex];
      const second = quiz[secondIndex];
      const key = pairKey(first.id, second.id);
      if (shown.has(key)) continue;
      const firstCount = displayCounts[first.id] ?? 0;
      const secondCount = displayCounts[second.id] ?? 0;
      if (firstCount >= config.artworkExposureCap || secondCount >= config.artworkExposureCap) continue;
      const separation = 1 - cosineSimilarity(embeddings[first.id], embeddings[second.id]);
      if (!Number.isFinite(separation) || separation < config.distanceThresholds.minimumSeparation) continue;
      const margin = Math.abs(artworkScore(preferenceVector, embeddings[first.id]) - artworkScore(preferenceVector, embeddings[second.id]));
      const uncertainty = 1 - clamp(margin / config.adaptiveMarginScale);
      const separationScore = clamp(separation);
      const unseen = firstCount === 0 || secondCount === 0 ? 1 : 0;
      const novelty = (metadataNovelty(first, displayed) + metadataNovelty(second, displayed)) / 2;
      const underTested = underTestedConceptScore(first, second, answers, artworkById, config.conceptGroups);
      const coverage = unseen * config.adaptiveCoverageWeights.unseenArtwork
        + novelty * config.adaptiveCoverageWeights.metadataNovelty
        + underTested * config.adaptiveCoverageWeights.underTestedConcept;
      const repeat = (firstCount + secondCount) / (2 * config.artworkExposureCap);
      const informationScore = uncertainty * config.adaptiveWeights.uncertainty
        + separationScore * config.adaptiveWeights.separation
        + coverage * config.adaptiveWeights.coverage
        - repeat * config.adaptiveWeights.repeatPenalty;
      candidates.push({
        id: `adaptive-${key}`,
        leftId: first.id,
        rightId: second.id,
        key,
        margin,
        separation,
        informationScore,
        includesUnseen: unseen === 1
      });
    }
  }

  const unseenCandidates = candidates.filter((candidate) => candidate.includesUnseen);
  const eligible = unseenCandidates.length ? unseenCandidates : candidates;
  eligible.sort((first, second) => second.informationScore - first.informationScore || first.key.localeCompare(second.key));
  return eligible[0] ?? null;
}

export function confidenceLabel(score, thresholds) {
  if (score >= thresholds.strong) return "Strong";
  if (score >= thresholds.moderate) return "Moderate";
  return "Emerging";
}

export function summarizeConcepts(answers, artworks, conceptGroups, config) {
  const artworkById = new Map(artworks.map((artwork) => [artwork.id, artwork]));
  const directional = answers.filter((answer) => answer.choice !== "neither");
  return conceptGroups.map((group) => {
    const evidence = directional.map((answer) => {
      const chosenAxis = conceptAxis(artworkById.get(answer.chosenId) ?? {}, group);
      const rejectedAxis = conceptAxis(artworkById.get(answer.rejectedId) ?? {}, group);
      return {
        pairId: answer.pairId,
        value: Number.isFinite(chosenAxis) && Number.isFinite(rejectedAxis) ? chosenAxis - rejectedAxis : null,
        chosenId: answer.chosenId,
        rejectedId: answer.rejectedId
      };
    }).filter((item) => Number.isFinite(item.value));
    const average = evidence.length ? evidence.reduce((sum, item) => sum + item.value, 0) / evidence.length : 0;
    const strength = clamp(Math.abs(average) / 2);
    const favoredIndex = average >= 0 ? 1 : 0;
    const direction = average === 0 ? 0 : Math.sign(average);
    const supporting = evidence.filter((item) => Math.sign(item.value) === direction && item.value !== 0);
    const contradicting = evidence.filter((item) => Math.sign(item.value) === -direction && item.value !== 0);
    const consistency = evidence.length ? supporting.length / evidence.length : 0;
    const uniqueWorks = new Set(evidence.flatMap((item) => [item.chosenId, item.rejectedId])).size;
    const quantity = clamp(evidence.length / config.signalThresholds.strongAnswers);
    const coverage = clamp(uniqueWorks / (config.signalThresholds.strongAnswers * 2));
    const confidenceScore = quantity * config.confidenceWeights.quantity
      + consistency * config.confidenceWeights.consistency
      + coverage * config.confidenceWeights.coverage;
    const mixed = strength < config.signalThresholds.mixedSignal || supporting.length <= contradicting.length;
    return {
      dimension: group.dimension,
      label: group.labels[favoredIndex],
      oppositeLabel: group.labels[1 - favoredIndex],
      strength,
      position: Math.round(clamp(50 + average * 25, 0, 100)),
      mixed,
      confidence: mixed ? "Emerging" : confidenceLabel(confidenceScore, config.confidenceThresholds),
      confidenceScore,
      evidenceCount: evidence.length,
      supportingChoiceIds: supporting.map((item) => item.pairId),
      contradictingChoiceIds: contradicting.map((item) => item.pairId)
    };
  });
}

function factualValues(artwork) {
  return [
    { dimension: "Medium", value: mediumGroup(artwork.medium) },
    { dimension: "Period", value: periodBand(artwork.yearStart) },
    { dimension: "Culture or region", value: artwork.cultureOrRegion || "" },
    { dimension: "Movement or style", value: artwork.movementOrStyle || "" }
  ];
}

export function summarizeFactualTendencies(answers, artworks, config) {
  const artworkById = new Map(artworks.map((artwork) => [artwork.id, artwork]));
  const records = new Map();
  for (const answer of answers.filter((item) => item.choice !== "neither")) {
    const chosen = artworkById.get(answer.chosenId);
    const rejected = artworkById.get(answer.rejectedId);
    if (!chosen || !rejected) continue;
    for (const item of factualValues(chosen)) {
      if (!item.value) continue;
      const key = `${item.dimension}\u0000${item.value}`;
      const record = records.get(key) ?? { dimension: item.dimension, value: item.value, selectedArtworkIds: new Set(), rejectedArtworkIds: new Set() };
      record.selectedArtworkIds.add(chosen.id);
      records.set(key, record);
    }
    for (const item of factualValues(rejected)) {
      if (!item.value) continue;
      const key = `${item.dimension}\u0000${item.value}`;
      const record = records.get(key) ?? { dimension: item.dimension, value: item.value, selectedArtworkIds: new Set(), rejectedArtworkIds: new Set() };
      record.rejectedArtworkIds.add(rejected.id);
      records.set(key, record);
    }
  }
  return [...records.values()]
    .map((record) => ({
      dimension: record.dimension,
      value: record.value,
      selected: record.selectedArtworkIds.size,
      rejected: record.rejectedArtworkIds.size,
      exposure: new Set([...record.selectedArtworkIds, ...record.rejectedArtworkIds]).size
    }))
    .filter((record) => record.exposure >= config.minimumFactualExposure && record.selected !== record.rejected)
    .map((record) => {
      const net = record.selected - record.rejected;
      const strength = Math.abs(net) / record.exposure;
      const evidenceScore = clamp(record.exposure / config.signalThresholds.strongAnswers) * 0.5 + strength * 0.5;
      return { ...record, direction: net > 0 ? "favored" : "less favored", strength, confidence: confidenceLabel(evidenceScore, config.confidenceThresholds) };
    })
    .sort((first, second) => second.strength - first.strength || second.exposure - first.exposure || `${first.dimension}:${first.value}`.localeCompare(`${second.dimension}:${second.value}`));
}

export function chooseProfileName(attributeResults, config) {
  const supported = attributeResults
    .filter((result) => !result.mixed && result.confidence !== "Emerging")
    .sort((first, second) => second.strength - first.strength || first.dimension.localeCompare(second.dimension));
  const leading = supported.slice(0, 2);
  if (leading.length < 2) return { name: config.fallbackProfileName, attributes: leading };
  const labels = new Set(leading.map((item) => item.label));
  const rule = config.profileNameRules.find((item) => item.labels.every((label) => labels.has(label)));
  return { name: rule?.name ?? config.fallbackProfileName, attributes: leading };
}

function artworkFavoredLabels(artwork, conceptGroups) {
  return conceptGroups.map((group) => {
    const first = artwork.conceptScores?.[group.keys[0]];
    const second = artwork.conceptScores?.[group.keys[1]];
    if (!Number.isFinite(first) || !Number.isFinite(second)) return "";
    return first > second ? group.labels[0] : group.labels[1];
  }).filter(Boolean);
}

export function rankRecommendations(artworks, embeddings, preferenceVector, attributeResults, factualTendencies, config) {
  if (!preferenceVector.length) return [];
  const supportedLabels = attributeResults.filter((item) => !item.mixed).map((item) => item.label);
  const favoredFacts = factualTendencies.filter((item) => item.direction === "favored");
  return artworks
    .filter((artwork) => artwork.quizRole === "recommendation")
    .map((artwork) => {
      const matchingSignals = artworkFavoredLabels(artwork, config.conceptGroups).filter((label) => supportedLabels.includes(label)).slice(0, 2);
      const facts = factualValues(artwork);
      const matchingFact = favoredFacts.find((tendency) => facts.some((fact) => fact.dimension === tendency.dimension && fact.value === tendency.value));
      let explanation = "Its prepared visual embedding points in a similar direction to your recorded choices.";
      if (matchingSignals.length) explanation = `Its prepared visual signals align with your ${matchingSignals.map((label) => label.toLowerCase()).join(" and ")} choices.`;
      else if (matchingFact) explanation = `It also belongs to the ${matchingFact.value.toLowerCase()} group that appeared more often in your selected works.`;
      return { artwork, score: artworkScore(preferenceVector, embeddings[artwork.id]), explanation, matchingSignals };
    })
    .sort((first, second) => second.score - first.score || first.artwork.id.localeCompare(second.artwork.id))
    .slice(0, config.recommendationLimit);
}

function reconstructionConsistency(answers, embeddings, preferenceVector) {
  const directional = answers.filter((answer) => answer.choice !== "neither");
  if (!directional.length || !preferenceVector.length) return 0;
  const reconstructed = directional.filter((answer) => artworkScore(preferenceVector, embeddings[answer.chosenId]) >= artworkScore(preferenceVector, embeddings[answer.rejectedId])).length;
  return reconstructed / directional.length;
}

function overallConfidence(answers, embeddings, preferenceVector, config) {
  const directional = answers.filter((answer) => answer.choice !== "neither");
  const quantity = clamp(directional.length / (config.initialComparisonCount + config.adaptiveComparisonCount));
  const consistency = reconstructionConsistency(answers, embeddings, preferenceVector);
  const coverage = clamp(new Set(directional.flatMap((answer) => [answer.chosenId, answer.rejectedId])).size / 16);
  const score = quantity * config.confidenceWeights.quantity + consistency * config.confidenceWeights.consistency + coverage * config.confidenceWeights.coverage;
  return { label: confidenceLabel(score, config.confidenceThresholds), score, quantity, consistency, coverage };
}

export function createTasteResult(answers, artworks, embeddings, config) {
  const directional = answers.filter((answer) => answer.choice !== "neither");
  const preferenceVector = preferenceFromAnswers(answers, embeddings);
  const insufficient = directional.length === 0 || preferenceVector.every((value) => value === 0);
  const attributeResults = summarizeConcepts(answers, artworks, config.conceptGroups, config);
  const supported = attributeResults.filter((result) => !result.mixed).sort((first, second) => second.strength - first.strength || first.dimension.localeCompare(second.dimension)).slice(0, config.resultLimit);
  const mixed = attributeResults.filter((result) => result.mixed).sort((first, second) => first.strength - second.strength || first.dimension.localeCompare(second.dimension));
  const allFactualTendencies = summarizeFactualTendencies(answers, artworks, config);
  const preferredMovementStyles = allFactualTendencies
    .filter((item) => item.dimension === "Movement or style" && item.direction === "favored")
    .slice(0, 2);
  const preferredStyleKeys = new Set(preferredMovementStyles.map((item) => `${item.dimension}\u0000${item.value}`));
  const factualTendencies = [
    ...preferredMovementStyles,
    ...allFactualTendencies.filter((item) => !preferredStyleKeys.has(`${item.dimension}\u0000${item.value}`))
  ].slice(0, 4);
  const profile = insufficient ? { name: config.fallbackProfileName, attributes: [] } : chooseProfileName(attributeResults, config);
  const recommendations = insufficient ? [] : rankRecommendations(artworks, embeddings, preferenceVector, attributeResults, factualTendencies, config);
  const artworkById = new Map(artworks.map((artwork) => [artwork.id, artwork]));
  const representativeChoices = directional
    .map((answer) => ({
      answer,
      alignment: artworkScore(preferenceVector, embeddings[answer.chosenId]) - artworkScore(preferenceVector, embeddings[answer.rejectedId])
    }))
    .sort((first, second) => second.alignment - first.alignment || first.answer.pairId.localeCompare(second.answer.pairId))
    .slice(0, config.representativeChoiceLimit)
    .map(({ answer }) => ({ pairId: answer.pairId, chosen: artworkById.get(answer.chosenId), rejected: artworkById.get(answer.rejectedId) }));

  return {
    insufficient,
    directionalCount: directional.length,
    neitherCount: answers.length - directional.length,
    preferenceVector,
    supported,
    mixed,
    representativeChoices,
    attributeResults,
    factualTendencies,
    preferredMovementStyles,
    profileName: profile.name,
    profileAttributes: profile.attributes,
    recommendations,
    overallConfidence: overallConfidence(answers, embeddings, preferenceVector, config)
  };
}

export function createChallenge(artworks, embeddings, frozenPreferenceVector, pairCount = 3) {
  const holdout = artworks.filter((artwork) => artwork.quizRole === "holdout").sort((first, second) => first.id.localeCompare(second.id));
  const pairs = [];
  for (let index = 0; index < pairCount; index += 1) {
    const left = holdout[index * 2];
    const right = holdout[index * 2 + 1];
    if (!left || !right) break;
    const leftScore = artworkScore(frozenPreferenceVector, embeddings[left.id]);
    const rightScore = artworkScore(frozenPreferenceVector, embeddings[right.id]);
    const predictedId = leftScore === rightScore ? [left.id, right.id].sort()[0] : leftScore > rightScore ? left.id : right.id;
    pairs.push({ id: `challenge-${index + 1}`, leftId: left.id, rightId: right.id, predictedId });
  }
  return { frozenVector: [...frozenPreferenceVector], pairs };
}

export function scoreChallenge(answers) {
  const directional = answers.filter((answer) => answer.choice === "left" || answer.choice === "right");
  return {
    agreements: directional.filter((answer) => answer.agreed).length,
    directionalTrials: directional.length,
    inconclusiveTrials: answers.filter((answer) => answer.choice === "neither").length,
    unavailableTrials: answers.filter((answer) => answer.choice === "unavailable").length
  };
}

export function createInitialState() {
  return {
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
  };
}
