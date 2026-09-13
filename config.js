export const config = Object.freeze({
  dataPaths: Object.freeze({
    sample: "data/sample.json",
    artworks: "data/artworks.json",
    embeddings: "data/embeddings.json",
    initialPairs: "data/initial-pairs.json"
  }),
  initialComparisonCount: 8,
  adaptiveComparisonCount: 6,
  minimumAdaptiveAnswers: 3,
  artworkExposureCap: 3,
  adaptiveWeights: Object.freeze({
    uncertainty: 0.5,
    separation: 0.25,
    coverage: 0.2,
    repeatPenalty: 0.05
  }),
  distanceThresholds: Object.freeze({
    minimumSeparation: 0.08,
    nearDuplicate: 0.03
  }),
  confidenceThresholds: Object.freeze({
    moderate: 0.45,
    strong: 0.75
  }),
  signalThresholds: Object.freeze({
    mixedSignal: 0.045,
    moderateSignal: 0.08,
    strongSignal: 0.16,
    moderateAnswers: 3,
    strongAnswers: 6
  }),
  resultLimit: 4,
  recommendationLimit: 4,
  representativeChoiceLimit: 3,
  featureFlags: Object.freeze({
    adaptiveQuiz: false,
    predictionChallenge: false,
    recommendations: false
  }),
  conceptLabels: Object.freeze([
    "abstract / figurative",
    "minimal / visually dense",
    "geometric / organic",
    "restrained / saturated color",
    "calm / dramatic",
    "traditional / experimental"
  ]),
  conceptGroups: Object.freeze([
    Object.freeze({ dimension: "Representation", keys: Object.freeze(["abstract", "figurative"]), labels: Object.freeze(["Abstract", "Figurative"]) }),
    Object.freeze({ dimension: "Visual density", keys: Object.freeze(["minimal", "visuallyDense"]), labels: Object.freeze(["Minimal", "Visually dense"]) }),
    Object.freeze({ dimension: "Structure", keys: Object.freeze(["geometric", "organic"]), labels: Object.freeze(["Geometric", "Organic"]) }),
    Object.freeze({ dimension: "Color", keys: Object.freeze(["restrainedColor", "saturatedColor"]), labels: Object.freeze(["Restrained color", "Saturated color"]) }),
    Object.freeze({ dimension: "Mood", keys: Object.freeze(["calm", "dramatic"]), labels: Object.freeze(["Calm", "Dramatic"]) }),
    Object.freeze({ dimension: "Approach", keys: Object.freeze(["traditional", "experimental"]), labels: Object.freeze(["Traditional", "Experimental"]) })
  ]),
  conceptPromptVersion: "core-concepts-v1",
  previewDelayMilliseconds: 500
});
