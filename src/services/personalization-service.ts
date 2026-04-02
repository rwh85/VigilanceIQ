import { PVTResult, ModelParameters, GROUP_AVERAGE_PARAMS } from '../models/types';
import { Constants } from '../models/constants';

export class PersonalizationService {
  private readonly minTests = Constants.Model.minTestsForPersonalization;

  getProgress(results: PVTResult[]): number {
    return Math.min(1.0, results.length / this.minTests);
  }

  isPersonalized(results: PVTResult[]): boolean {
    return results.length >= this.minTests;
  }

  updateParameters(currentParams: ModelParameters, results: PVTResult[]): ModelParameters {
    if (results.length < this.minTests) return currentParams;
    return {
      ...currentParams,
      kappa: this.updateKappa(results),
      gamma: this.updateGamma(results),
      rho: this.updateRho(results),
      phi: this.updatePhi(results),
    };
  }

  updateKappa(results: PVTResult[]): number {
    const wellRested = results.filter((r) => {
      if (r.sleepHoursPriorNight != null && r.hoursAwake != null) {
        return r.sleepHoursPriorNight >= 7.0 && r.hoursAwake <= 4.0;
      }
      return r.isBaseline;
    });
    if (wellRested.length === 0) return GROUP_AVERAGE_PARAMS.kappa;
    const meanBaseline = wellRested.reduce((sum, r) => {
      const mean = r.reactionTimes.reduce((a, b) => a + b, 0) / r.reactionTimes.length;
      return sum + mean;
    }, 0) / wellRested.length;
    return meanBaseline;
  }

  updateGamma(results: PVTResult[]): number {
    const morning: number[] = [];
    const afternoon: number[] = [];
    for (const result of results) {
      const hour = result.timestamp.getHours();
      const mean = result.reactionTimes.reduce((a, b) => a + b, 0) / result.reactionTimes.length;
      if (hour >= 6 && hour <= 10) morning.push(mean);
      else if (hour >= 11 && hour <= 16) afternoon.push(mean);
    }
    if (morning.length === 0 || afternoon.length === 0) return GROUP_AVERAGE_PARAMS.gamma;
    const morningMean = morning.reduce((a, b) => a + b, 0) / morning.length;
    const afternoonMean = afternoon.reduce((a, b) => a + b, 0) / afternoon.length;
    const amplitude = Math.abs(morningMean - afternoonMean) / 2;
    return Math.max(50, Math.min(150, amplitude));
  }

  updateRho(results: PVTResult[]): number {
    const valid = results.filter((r) => r.hoursAwake != null);
    if (valid.length < 5) return GROUP_AVERAGE_PARAMS.rho;
    const points = valid.map((r) => ({
      x: r.hoursAwake!,
      y: r.reactionTimes.reduce((a, b) => a + b, 0) / r.reactionTimes.length,
    }));
    const n = points.length;
    const sumX = points.reduce((s, p) => s + p.x, 0);
    const sumY = points.reduce((s, p) => s + p.y, 0);
    const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
    const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
    const denominator = n * sumX2 - sumX * sumX;
    if (denominator === 0) return GROUP_AVERAGE_PARAMS.rho;
    const slope = (n * sumXY - sumX * sumY) / denominator;
    return Math.max(0.01, Math.min(0.025, slope / 40));
  }

  updatePhi(results: PVTResult[]): number {
    if (results.length < 5) return GROUP_AVERAGE_PARAMS.phi;
    const hourlyPerformance: Record<number, number[]> = {};
    for (const result of results) {
      const hour = result.timestamp.getHours();
      const mean = result.reactionTimes.reduce((a, b) => a + b, 0) / result.reactionTimes.length;
      (hourlyPerformance[hour] ??= []).push(mean);
    }
    let worstHour = 5;
    let worstMean = 0;
    for (const [hourStr, rts] of Object.entries(hourlyPerformance)) {
      const mean = rts.reduce((a, b) => a + b, 0) / rts.length;
      if (mean > worstMean) { worstMean = mean; worstHour = Number(hourStr); }
    }
    const phaseShift = worstHour - 5.0;
    return Math.max(-3, Math.min(3, phaseShift));
  }
}
