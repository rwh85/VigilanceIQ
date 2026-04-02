import { ModelParameters, CaffeineIntake, AlertnessPrediction, GROUP_AVERAGE_PARAMS } from './types';

interface SleepWakeScheduleInput {
  wakeTimes: [number, number][];
  sleepTimes: [number, number][];
}

export class AlertnessModel {
  params: ModelParameters;

  constructor(params: ModelParameters = GROUP_AVERAGE_PARAMS) {
    this.params = params;
  }

  homeostaticProcess(hoursAwake: number): number {
    const S = this.params.xi + (1 - this.params.xi) * (1 - Math.exp(-this.params.rho * hoursAwake));
    return Math.min(S, 1.0);
  }

  circadianProcess(timeHour: number): number {
    let circadian = 0;
    for (const [harmonicStr, amplitude] of Object.entries(this.params.circadianHarmonics)) {
      const harmonic = Number(harmonicStr);
      const angle = (2 * Math.PI * harmonic * (timeHour - this.params.phi)) / this.params.period;
      circadian += amplitude * Math.sin(angle);
    }
    return circadian;
  }

  caffeineEffect(timeHour: number, caffeineHistory: CaffeineIntake[]): number {
    let total = 0;
    const kElimination = Math.log(2) / this.params.caffeineHalfLife;
    const kAbsorption = this.params.caffeineAbsorptionRate;

    for (const intake of caffeineHistory) {
      const timeSinceDose = timeHour - intake.timeHour;
      if (timeSinceDose > 0) {
        const coefficient = kAbsorption / (kAbsorption - kElimination);
        const effect =
          intake.doseMg *
          coefficient *
          (Math.exp(-kElimination * timeSinceDose) - Math.exp(-kAbsorption * timeSinceDose));
        total += Math.max(0, effect);
      }
    }
    return total;
  }

  caffeineImpairmentReduction(caffeineLevelMg: number): number {
    const maxReductionMs = 100.0;
    const halfEfficacyDose = 150.0;
    return maxReductionMs * (caffeineLevelMg / (halfEfficacyDose + caffeineLevelMg));
  }

  alertnessImpairment(
    timeHour: number,
    hoursAwake: number,
    caffeineHistory: CaffeineIntake[],
  ): number {
    const S = this.homeostaticProcess(hoursAwake);
    const C = this.circadianProcess(timeHour);

    const homeostaticContribution = this.params.beta * S * 100;
    const circadianContribution = this.params.gamma * C;

    const caffeineLevel = this.caffeineEffect(timeHour, caffeineHistory);
    const caffeineReduction = this.caffeineImpairmentReduction(caffeineLevel);

    const impairmentMs =
      this.params.kappa + homeostaticContribution + circadianContribution - caffeineReduction;

    return Math.max(impairmentMs, this.params.baselineRtMs);
  }

  bacEquivalence(reactionTimeMs: number): number {
    const impairment = reactionTimeMs - this.params.baselineRtMs;
    const bacPercent = (impairment / 50.0) * 0.05;
    return Math.max(0, bacPercent);
  }

  predictTimeseries(
    schedule: SleepWakeScheduleInput,
    durationHours: number,
    caffeineIntakes: CaffeineIntake[],
    timeStep: number = 0.5,
    startHourOfDay: number = 0,
  ): AlertnessPrediction {
    const times: number[] = [];
    const impairments: number[] = [];
    const homeostaticValues: number[] = [];
    const circadianValues: number[] = [];
    const caffeineLevels: number[] = [];

    let hoursAwakeRunning = 0;
    let wasAwake = true;

    const isAwake = (t: number): boolean => {
      for (const [wakeStart, wakeEnd] of schedule.wakeTimes) {
        if (wakeStart <= t && t <= wakeEnd) return true;
      }
      return false;
    };

    for (let t = 0; t <= durationHours; t += timeStep) {
      times.push(t);

      const awake = isAwake(t);
      if (awake) {
        hoursAwakeRunning = wasAwake ? hoursAwakeRunning + timeStep : timeStep;
      } else {
        hoursAwakeRunning = 0;
      }

      const clockTime = (startHourOfDay + t) % 24;

      const S = this.homeostaticProcess(hoursAwakeRunning);
      const C = this.circadianProcess(clockTime);
      const caffeineLevel = this.caffeineEffect(t, caffeineIntakes);
      const impairment = this.alertnessImpairment(clockTime, hoursAwakeRunning, caffeineIntakes);

      impairments.push(impairment);
      homeostaticValues.push(S);
      circadianValues.push(C);
      caffeineLevels.push(caffeineLevel);

      wasAwake = awake;
    }

    return { times, impairments, homeostaticValues, circadianValues, caffeineLevels };
  }
}
