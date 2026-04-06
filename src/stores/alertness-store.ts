import { create } from 'zustand';
import { AlertnessModel } from '../models/alertness-model';
import { SleepWakeSchedule } from '../models/sleep-wake-schedule';
import { AlertnessPrediction, CaffeineIntake, ModelParameters, GROUP_AVERAGE_PARAMS } from '../models/types';
import { sendDrowsinessAlert } from '../services/notification-service';

const ALERT_COOLDOWN_MS = 7200000; // 2 hours between alerts

interface DrowsinessAlertOptions {
  enabled: boolean;
  thresholdMs: number;
}

interface AlertnessState {
  currentImpairment: number;
  currentBAC: number;
  prediction: AlertnessPrediction | null;
  hoursAwake: number;
  alertActive: boolean;
  lastAlertTime: number | null;

  updatePrediction: (
    params: ModelParameters,
    caffeineIntakes: CaffeineIntake[],
    schedule: SleepWakeSchedule,
    hoursAwake: number,
    forecastHours: number,
    alertOptions?: DrowsinessAlertOptions,
  ) => void;
  dismissDrowsinessAlert: () => void;
}

export const useAlertnessStore = create<AlertnessState>((set, get) => ({
  currentImpairment: GROUP_AVERAGE_PARAMS.kappa,
  currentBAC: 0,
  prediction: null,
  hoursAwake: 0,
  alertActive: false,
  lastAlertTime: null,

  updatePrediction: (params, caffeineIntakes, schedule, hoursAwake, forecastHours, alertOptions) => {
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

    const state = get();
    let alertActive = state.alertActive;
    let lastAlertTime = state.lastAlertTime;

    if (alertOptions?.enabled && currentImpairment >= alertOptions.thresholdMs) {
      const cooldownPassed =
        lastAlertTime === null || Date.now() - lastAlertTime > ALERT_COOLDOWN_MS;
      if (cooldownPassed && !alertActive) {
        alertActive = true;
        lastAlertTime = Date.now();
        sendDrowsinessAlert();
      }
    }

    set({
      currentImpairment,
      currentBAC: model.bacEquivalence(currentImpairment),
      prediction,
      hoursAwake,
      alertActive,
      lastAlertTime,
    });
  },

  dismissDrowsinessAlert: () => {
    set({ alertActive: false });
  },
}));
