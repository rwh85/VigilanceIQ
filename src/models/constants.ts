export const Constants = {
  AlertnessThresholds: {
    excellent: 360.0,
    good: 400.0,
    fair: 467.0,
    poor: 533.0,
    lapse: 667.0,
  },
  AlertnessScale: { maxScore: 10.0, minScore: 1.0 },
  Caffeine: {
    defaultHalfLife: 5.7,
    maxDailyMg: 400.0,
    defaultCutoffHour: 16,
    moderateDose: 200.0,
    highDose: 300.0,
  },
  Sleep: { minRecommendedHours: 7.0, optimalHours: 8.0, maxHoursAwakeForBaseline: 4.0 },
  PVTTest: {
    standardDurationSeconds: 60,
    quickDurationSeconds: 30,
    minStimulusInterval: 2.0,
    maxStimulusInterval: 10.0,
    requiredBaselineTests: 3,
  },
  Monitoring: {
    checkIntervalSeconds: 1800,
    minRecommendationIntervalSeconds: 7200,
    moderateImpairmentThreshold: 467.0,
    severeImpairmentThreshold: 533.0,
  },
  Model: { minTestsForPersonalization: 10, circadianPeriodHours: 24.0, defaultBaselineRtMs: 360.0 },
  DisplayLatency: { minimumValidRtMs: 100.0 },
} as const;
