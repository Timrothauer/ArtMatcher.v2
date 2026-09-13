export const config = Object.freeze({
  dataPaths: Object.freeze({
    sample: "data/sample.json"
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
  resultLimit: 4,
  recommendationLimit: 4,
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
  conceptPromptVersion: "not-used-in-phase-0",
  previewDelayMilliseconds: 500
});
