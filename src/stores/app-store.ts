import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DrowsinessThreshold = 'low' | 'medium' | 'high';

// Maps sensitivity to reaction-time impairment threshold (ms). Higher RT = worse alertness.
// high = fires early (at good/fair boundary), low = fires late (at severe impairment only)
export const DROWSINESS_THRESHOLD_MS: Record<DrowsinessThreshold, number> = {
  high: 400,
  medium: 467,
  low: 533,
};

interface AppState {
  hasSeenOnboarding: boolean;
  forecastDurationHours: number;
  caffeineHalfLife: number;
  caffeineCutoffHour: number;
  maxDailyCaffeineMg: number;
  drowsinessAlertsEnabled: boolean;
  drowsinessThreshold: DrowsinessThreshold;

  setOnboardingComplete: () => void;
  setForecastDuration: (hours: number) => void;
  setCaffeineHalfLife: (hours: number) => void;
  setCaffeineCutoffHour: (hour: number) => void;
  setMaxDailyCaffeine: (mg: number) => void;
  setDrowsinessAlertsEnabled: (enabled: boolean) => void;
  setDrowsinessThreshold: (threshold: DrowsinessThreshold) => void;
  loadPersistedState: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  hasSeenOnboarding: false,
  forecastDurationHours: 24,
  caffeineHalfLife: 5.7,
  caffeineCutoffHour: 16,
  maxDailyCaffeineMg: 400,
  drowsinessAlertsEnabled: true,
  drowsinessThreshold: 'medium',

  setOnboardingComplete: () => {
    set({ hasSeenOnboarding: true });
    AsyncStorage.setItem('hasSeenOnboarding', 'true');
  },

  setForecastDuration: (hours: number) => {
    set({ forecastDurationHours: hours });
    AsyncStorage.setItem('forecastDurationHours', String(hours));
  },

  setCaffeineHalfLife: (hours: number) => {
    set({ caffeineHalfLife: hours });
    AsyncStorage.setItem('caffeineHalfLife', String(hours));
  },

  setCaffeineCutoffHour: (hour: number) => {
    set({ caffeineCutoffHour: hour });
    AsyncStorage.setItem('caffeineCutoffHour', String(hour));
  },

  setMaxDailyCaffeine: (mg: number) => {
    set({ maxDailyCaffeineMg: mg });
    AsyncStorage.setItem('maxDailyCaffeineMg', String(mg));
  },

  setDrowsinessAlertsEnabled: (enabled: boolean) => {
    set({ drowsinessAlertsEnabled: enabled });
    AsyncStorage.setItem('drowsinessAlertsEnabled', String(enabled));
  },

  setDrowsinessThreshold: (threshold: DrowsinessThreshold) => {
    set({ drowsinessThreshold: threshold });
    AsyncStorage.setItem('drowsinessThreshold', threshold);
  },

  loadPersistedState: async () => {
    const [onboarding, forecast, halfLife, cutoff, maxDaily, alertsEnabled, alertThreshold] = await Promise.all([
      AsyncStorage.getItem('hasSeenOnboarding'),
      AsyncStorage.getItem('forecastDurationHours'),
      AsyncStorage.getItem('caffeineHalfLife'),
      AsyncStorage.getItem('caffeineCutoffHour'),
      AsyncStorage.getItem('maxDailyCaffeineMg'),
      AsyncStorage.getItem('drowsinessAlertsEnabled'),
      AsyncStorage.getItem('drowsinessThreshold'),
    ]);

    set({
      hasSeenOnboarding: onboarding === 'true',
      forecastDurationHours: forecast ? Number(forecast) : 24,
      caffeineHalfLife: halfLife ? Number(halfLife) : 5.7,
      caffeineCutoffHour: cutoff ? Number(cutoff) : 16,
      maxDailyCaffeineMg: maxDaily ? Number(maxDaily) : 400,
      drowsinessAlertsEnabled: alertsEnabled !== null ? alertsEnabled === 'true' : true,
      drowsinessThreshold: (alertThreshold as DrowsinessThreshold) ?? 'medium',
    });
  },
}));
