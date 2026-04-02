import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  hasSeenOnboarding: boolean;
  forecastDurationHours: number;
  caffeineHalfLife: number;
  caffeineCutoffHour: number;
  maxDailyCaffeineMg: number;

  setOnboardingComplete: () => void;
  setForecastDuration: (hours: number) => void;
  setCaffeineHalfLife: (hours: number) => void;
  setCaffeineCutoffHour: (hour: number) => void;
  setMaxDailyCaffeine: (mg: number) => void;
  loadPersistedState: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  hasSeenOnboarding: false,
  forecastDurationHours: 24,
  caffeineHalfLife: 5.7,
  caffeineCutoffHour: 16,
  maxDailyCaffeineMg: 400,

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

  loadPersistedState: async () => {
    const [onboarding, forecast, halfLife, cutoff, maxDaily] = await Promise.all([
      AsyncStorage.getItem('hasSeenOnboarding'),
      AsyncStorage.getItem('forecastDurationHours'),
      AsyncStorage.getItem('caffeineHalfLife'),
      AsyncStorage.getItem('caffeineCutoffHour'),
      AsyncStorage.getItem('maxDailyCaffeineMg'),
    ]);

    set({
      hasSeenOnboarding: onboarding === 'true',
      forecastDurationHours: forecast ? Number(forecast) : 24,
      caffeineHalfLife: halfLife ? Number(halfLife) : 5.7,
      caffeineCutoffHour: cutoff ? Number(cutoff) : 16,
      maxDailyCaffeineMg: maxDaily ? Number(maxDaily) : 400,
    });
  },
}));
