import { create } from 'zustand';
import { AlertnessModel } from '../models/alertness-model';
import { SleepWakeSchedule } from '../models/sleep-wake-schedule';
import { AlertnessPrediction, CaffeineIntake, ModelParameters, GROUP_AVERAGE_PARAMS } from '../models/types';

interface AlertnessState {
  currentImpairment: number;
  currentBAC: number;
  prediction: AlertnessPrediction | null;
  hoursAwake: number;

  updatePrediction: (
    params: ModelParameters,
    caffeineIntakes: CaffeineIntake[],
    schedule: SleepWakeSchedule,
    hoursAwake: number,
    forecastHours: number,
  ) => void;
}

export const useAlertnessStore = create<AlertnessState>((set) => ({
  currentImpairment: GROUP_AVERAGE_PARAMS.kappa,
  currentBAC: 0,
  prediction: null,
  hoursAwake: 0,

  updatePrediction: (params, caffeineIntakes, schedule, hoursAwake, forecastHours) => {
    const model = new AlertnessModel(params);
    const now = new Date();
    const startHourOfDay = now.getHours() + now.getMinutes() / 60;

    const prediction = model.predictTimeseries(
      schedule,
      forecastHours,
      caffeineIntakes,
      0.5,
      startHourOfDay,
    );

    const currentImpairment = model.alertnessImpairment(
      startHourOfDay,
      hoursAwake,
      caffeineIntakes,
    );

    set({
      currentImpairment,
      currentBAC: model.bacEquivalence(currentImpairment),
      prediction,
      hoursAwake,
    });
  },
}));
