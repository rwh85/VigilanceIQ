import { AlertnessModel } from '../models/alertness-model';
import { AlertnessPrediction, CaffeineIntake, ModelParameters } from '../models/types';
import { Constants } from '../models/constants';

export interface NapRecommendation {
  napNow: boolean;
  napOffsetHours: number;       // hours from now when nap should start
  napDurationMinutes: number;   // recommended nap duration
  bestNapStartTime: Date;       // absolute time for the nap start
  bestNapEndTime: Date;         // absolute time for the nap end
  predictedBenefitPercent: number;
  explanation: string;
}

/**
 * Compute an optimal nap recommendation from the current alertness state.
 *
 * The algorithm:
 * 1. If current impairment exceeds the "fair" threshold, recommend napping now.
 * 2. Otherwise scan the next 4 hours of prediction for the PEAK impairment
 *    window — the best entry point before alertness deteriorates further.
 * 3. Choose duration: power nap (20 min) for moderate deficit; full cycle
 *    (90 min) only for severe, prolonged sleep deprivation.
 * 4. Estimate benefit by comparing impairment at nap-offset vs. predicted
 *    impairment 30 min after the nap ends (allowing for sleep inertia to clear).
 */
export function computeNapRecommendation(
  currentImpairment: number,
  hoursAwake: number,
  startHourOfDay: number,
  prediction: AlertnessPrediction,
): NapRecommendation {
  const isSevere = currentImpairment >= Constants.AlertnessThresholds.poor;
  const isFair = currentImpairment >= Constants.AlertnessThresholds.fair;

  // Choose nap duration
  const napDurationMinutes = isSevere && hoursAwake >= 12 ? 90 : 20;
  const napDurationHours = napDurationMinutes / 60;

  // Find optimal nap offset: scan next 4 hours for highest predicted impairment
  let napOffsetHours = 0;
  if (!isFair) {
    // Not yet impaired — find when it peaks so the user can nap just before
    const horizonSteps = Math.min(
      prediction.times.length,
      Math.ceil(4 / 0.5) + 1,
    );
    let peakImpairment = currentImpairment;
    for (let i = 1; i < horizonSteps; i++) {
      if (prediction.impairments[i] > peakImpairment) {
        peakImpairment = prediction.impairments[i];
        // Recommend napping 30 min before the predicted peak
        napOffsetHours = Math.max(0, prediction.times[i] - 0.5);
      }
    }
  }

  // Estimate post-nap impairment using a simple sleep inertia model:
  // After a power nap the homeostatic debt is partially cleared; we estimate
  // ~20% impairment reduction for power naps, ~35% for full cycles, lasting
  // 2–4 hours before the sleep drive resumes.
  const reductionFactor = napDurationMinutes <= 20 ? 0.20 : 0.35;
  const postNapImpairment =
    Constants.AlertnessThresholds.excellent +
    (currentImpairment - Constants.AlertnessThresholds.excellent) *
      (1 - reductionFactor);
  const benefitPercent = Math.round(
    ((currentImpairment - postNapImpairment) /
      (currentImpairment - Constants.AlertnessThresholds.excellent || 1)) *
      100,
  );

  const napNow = isFair || napOffsetHours === 0;
  const now = new Date();
  const bestNapStartTime = new Date(now.getTime() + napOffsetHours * 3600000);
  const bestNapEndTime = new Date(
    bestNapStartTime.getTime() + napDurationMinutes * 60000,
  );

  const explanation = buildExplanation(
    napNow,
    napOffsetHours,
    napDurationMinutes,
    benefitPercent,
    hoursAwake,
  );

  return {
    napNow,
    napOffsetHours,
    napDurationMinutes,
    bestNapStartTime,
    bestNapEndTime,
    predictedBenefitPercent: benefitPercent,
    explanation,
  };
}

function buildExplanation(
  napNow: boolean,
  napOffsetHours: number,
  napDurationMinutes: number,
  benefitPercent: number,
  hoursAwake: number,
): string {
  const durStr = napDurationMinutes === 20 ? '20-minute power nap' : '90-minute sleep cycle';

  if (napNow) {
    if (hoursAwake >= 16) {
      return `You've been awake ${Math.round(hoursAwake)} hours. A ${durStr} now is essential — pull over safely and rest before continuing.`;
    }
    return `A ${durStr} now will boost your alertness by ~${benefitPercent}% for the next ${napDurationMinutes <= 20 ? '2–3' : '4–6'} hours.`;
  }

  const offsetMinutes = Math.round(napOffsetHours * 60);
  const offsetStr =
    offsetMinutes < 60
      ? `in ${offsetMinutes} minutes`
      : `in ${(napOffsetHours).toFixed(1)} hours`;

  return `Your alertness will dip ${offsetStr}. A ${durStr} then will boost your alertness by ~${benefitPercent}% for the next ${napDurationMinutes <= 20 ? '2–3' : '4–6'} hours.`;
}

/**
 * Simulate what the alertness prediction looks like after taking the recommended nap.
 *
 * Creates a minimal schedule: sleeping from napOffsetHours to
 * napOffsetHours + napDurationHours, then awake. The `t=0` time axis
 * matches the existing prediction so both can be overlaid on a chart.
 */
export function computeAfterNapPrediction(
  params: ModelParameters,
  caffeineIntakes: CaffeineIntake[],
  napOffsetHours: number,
  napDurationMinutes: number,
  forecastHours: number,
  startHourOfDay: number,
): AlertnessPrediction {
  const model = new AlertnessModel(params);
  const napDurationHours = napDurationMinutes / 60;
  const napEnd = napOffsetHours + napDurationHours;

  const schedule = {
    wakeTimes: [
      [0, napOffsetHours],
      [napEnd, forecastHours],
    ] as [number, number][],
    sleepTimes: [[napOffsetHours, napEnd]] as [number, number][],
  };

  return model.predictTimeseries(
    schedule,
    forecastHours,
    caffeineIntakes,
    0.5,
    startHourOfDay,
  );
}
