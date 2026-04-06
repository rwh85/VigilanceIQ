import { Constants } from './constants';

// --- Caffeine ---

export type CaffeineSource =
  | 'coffee' | 'espresso' | 'tea' | 'energyDrink'
  | 'soda' | 'preworkout' | 'pill' | 'custom';

const TYPICAL_DOSES: Record<CaffeineSource, number> = {
  coffee: 95,
  espresso: 64,
  tea: 47,
  energyDrink: 80,
  soda: 34,
  preworkout: 200,
  pill: 200,
  custom: 100,
};

export function getTypicalDose(source: CaffeineSource): number {
  return TYPICAL_DOSES[source];
}

export interface CaffeineIntake {
  id: string;
  timeHour: number;
  timestamp: Date;
  doseMg: number;
  source: CaffeineSource;
  note?: string;
}

export interface CaffeinePreset {
  id: string;
  name: string;
  doseMg: number;
  iconName: string;
  sortOrder: number;
  source: CaffeineSource;
}

export const CAFFEINE_SOURCE_LABELS: Record<CaffeineSource, string> = {
  coffee: 'Coffee',
  espresso: 'Espresso',
  tea: 'Tea',
  energyDrink: 'Energy Drink',
  soda: 'Soda',
  preworkout: 'Pre-Workout',
  pill: 'Caffeine Pill',
  custom: 'Custom',
};

export const DEFAULT_CAFFEINE_PRESETS: CaffeinePreset[] = [
  { id: 'default-coffee', name: 'Coffee', doseMg: 95, iconName: 'cafe-outline', sortOrder: 0, source: 'coffee' },
  { id: 'default-espresso', name: 'Espresso', doseMg: 64, iconName: 'cafe', sortOrder: 1, source: 'espresso' },
  { id: 'default-tea', name: 'Tea', doseMg: 47, iconName: 'leaf-outline', sortOrder: 2, source: 'tea' },
  { id: 'default-energy', name: 'Energy Drink', doseMg: 80, iconName: 'flash-outline', sortOrder: 3, source: 'energyDrink' },
  { id: 'default-soda', name: 'Soda', doseMg: 34, iconName: 'water-outline', sortOrder: 4, source: 'soda' },
  { id: 'default-preworkout', name: 'Pre-Workout', doseMg: 200, iconName: 'barbell-outline', sortOrder: 5, source: 'preworkout' },
];

// --- Sleep ---

export type SleepSource = 'healthkit' | 'healthconnect' | 'manual';

export type SleepQuality = 'poor' | 'fair' | 'good' | 'excellent';

export interface SleepSession {
  id: string;
  startDate: Date;
  endDate: Date;
  source: SleepSource;
  quality?: SleepQuality;
}

// --- PVT ---

export type PerformanceLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'veryPoor';

/**
 * Converts a reaction time (ms) to a continuous 1–10 alertness score.
 * Matches the stepped breakpoints used across the app, interpolated for
 * smooth one-decimal display.
 */
export function reactionTimeToAlertness(reactionTimeMs: number): number {
  const controlPoints: [number, number][] = [
    [300, 10.0],
    [360, 9.0],
    [380, 8.0],
    [400, 7.0],
    [430, 6.0],
    [467, 5.0],
    [500, 4.0],
    [533, 3.0],
    [600, 2.0],
    [667, 1.0],
  ];

  if (reactionTimeMs <= 300) return 10.0;
  if (reactionTimeMs >= 667) return 1.0;

  for (let i = 0; i < controlPoints.length - 1; i++) {
    const [ms0, score0] = controlPoints[i];
    const [ms1, score1] = controlPoints[i + 1];
    if (reactionTimeMs >= ms0 && reactionTimeMs < ms1) {
      const t = (reactionTimeMs - ms0) / (ms1 - ms0);
      return score0 + t * (score1 - score0);
    }
  }
  return 1.0;
}

export function getPerformanceLevel(meanRT: number): PerformanceLevel {
  const t = Constants.AlertnessThresholds;
  if (meanRT < t.excellent) return 'excellent';
  if (meanRT < t.good) return 'good';
  if (meanRT < t.fair) return 'fair';
  if (meanRT < t.poor) return 'poor';
  return 'veryPoor';
}

export const PERFORMANCE_COLORS: Record<PerformanceLevel, string> = {
  excellent: '#22c55e',
  good: '#2dd4bf',
  fair: '#eab308',
  poor: '#f97316',
  veryPoor: '#ef4444',
};

export const PERFORMANCE_LABELS: Record<PerformanceLevel, string> = {
  excellent: 'Well-rested and alert',
  good: 'Normal alertness',
  fair: 'Mild impairment',
  poor: 'Moderate impairment',
  veryPoor: 'Severe impairment',
};

export interface PVTResult {
  id: string;
  timestamp: Date;
  reactionTimes: number[];
  durationSeconds: number;
  isBaseline: boolean;
  sleepHoursPriorNight?: number;
  hoursAwake?: number;
}

// --- Model Parameters ---

export interface ModelParameters {
  rho: number;
  tauR: number;
  gamma: number;
  phi: number;
  period: number;
  circadianHarmonics: Record<number, number>;
  xi: number;
  beta: number;
  kappa: number;
  caffeineHalfLife: number;
  caffeineAbsorptionRate: number;
  baselineRtMs: number;
  maxSafeCaffeine24h: number;
}

export const GROUP_AVERAGE_PARAMS: ModelParameters = {
  rho: 0.01695,
  tauR: 59.0,
  gamma: 100.0,
  phi: 0.0,
  period: 24.0,
  circadianHarmonics: { 1: 0.97, 2: 0.22, 3: 0.07, 4: 0.03, 5: 0.001 },
  xi: 0.0,
  beta: 1.0,
  kappa: 360.0,
  caffeineHalfLife: 5.7,
  caffeineAbsorptionRate: 4.0,
  baselineRtMs: 360.0,
  maxSafeCaffeine24h: 400.0,
};

// --- Alertness Prediction ---

export interface AlertnessPrediction {
  times: number[];
  impairments: number[];
  homeostaticValues: number[];
  circadianValues: number[];
  caffeineLevels: number[];
}

// --- Achievements ---

export type AchievementId =
  | 'early_bird' | 'night_owl'
  | 'lightning_reflexes' | 'iron_focus'
  | 'week_warrior' | 'two_week_champion' | 'monthly_master'
  | 'baseline_complete' | 'fully_calibrated_ten' | 'dedicated_tester' | 'centurion';

export type AchievementCategory = 'consistency' | 'speed' | 'focus' | 'milestone';

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  iconName: string;
  category: AchievementCategory;
}

export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'early_bird', title: 'Early Bird', description: 'Complete a test before 7 AM', iconName: 'sunny-outline', category: 'consistency' },
  { id: 'night_owl', title: 'Night Owl', description: 'Complete a test after 10 PM', iconName: 'moon-outline', category: 'consistency' },
  { id: 'lightning_reflexes', title: 'Lightning Reflexes', description: 'Achieve a reaction time under 200ms', iconName: 'flash', category: 'speed' },
  { id: 'iron_focus', title: 'Iron Focus', description: 'Complete a test with zero lapses', iconName: 'eye-outline', category: 'focus' },
  { id: 'week_warrior', title: 'Week Warrior', description: 'Maintain a 7-day testing streak', iconName: 'flame-outline', category: 'consistency' },
  { id: 'two_week_champion', title: 'Two Week Champion', description: 'Maintain a 14-day testing streak', iconName: 'flame', category: 'consistency' },
  { id: 'monthly_master', title: 'Monthly Master', description: 'Maintain a 30-day testing streak', iconName: 'trophy-outline', category: 'consistency' },
  { id: 'baseline_complete', title: 'Baseline Complete', description: 'Complete 3 baseline calibration tests', iconName: 'checkmark-circle-outline', category: 'milestone' },
  { id: 'fully_calibrated_ten', title: 'Fully Calibrated', description: 'Complete 10 tests for full personalization', iconName: 'person-outline', category: 'milestone' },
  { id: 'dedicated_tester', title: 'Dedicated Tester', description: 'Complete 50 total tests', iconName: 'star-outline', category: 'milestone' },
  { id: 'centurion', title: 'Centurion', description: 'Complete 100 total tests', iconName: 'trophy', category: 'milestone' },
];
