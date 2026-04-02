import { create } from 'zustand';
import {
  SleepSession,
  PVTResult,
  CaffeineIntake,
  CaffeinePreset,
  ModelParameters,
  GROUP_AVERAGE_PARAMS,
  DEFAULT_CAFFEINE_PRESETS,
} from '../models/types';
import * as dbOps from '../services/database-operations';
import { PersonalizationService } from '../services/personalization-service';
import * as SecureStore from 'expo-secure-store';

interface DataState {
  sleepSessions: SleepSession[];
  pvtResults: PVTResult[];
  caffeineIntakes: CaffeineIntake[];
  caffeinePresets: CaffeinePreset[];
  userParameters: ModelParameters;
  personalizationProgress: number;

  loadAllData: () => Promise<void>;

  addSleepSession: (session: SleepSession) => Promise<void>;
  removeSleepSession: (id: string) => Promise<void>;

  addPVTResult: (result: PVTResult) => Promise<void>;
  removePVTResult: (id: string) => Promise<void>;

  addCaffeineIntake: (intake: CaffeineIntake) => Promise<void>;
  removeCaffeineIntake: (id: string) => Promise<void>;

  addCaffeinePreset: (preset: CaffeinePreset) => Promise<void>;
  removeCaffeinePreset: (id: string) => Promise<void>;

  clearAllData: () => Promise<void>;
}

const personalizationService = new PersonalizationService();

export const useDataStore = create<DataState>((set, get) => ({
  sleepSessions: [],
  pvtResults: [],
  caffeineIntakes: [],
  caffeinePresets: [],
  userParameters: GROUP_AVERAGE_PARAMS,
  personalizationProgress: 0,

  loadAllData: async () => {
    const [sessions, results, intakes, presets] = await Promise.all([
      dbOps.getSleepSessions(),
      dbOps.getPVTResults(),
      dbOps.getCaffeineIntakes(),
      dbOps.getCaffeinePresets(),
    ]);

    const storedParams = await SecureStore.getItemAsync('userParameters');
    const userParameters = storedParams ? JSON.parse(storedParams) : GROUP_AVERAGE_PARAMS;

    set({
      sleepSessions: sessions,
      pvtResults: results,
      caffeineIntakes: intakes,
      caffeinePresets: presets.length > 0 ? presets : DEFAULT_CAFFEINE_PRESETS,
      userParameters,
      personalizationProgress: personalizationService.getProgress(results),
    });
  },

  addSleepSession: async (session) => {
    await dbOps.saveSleepSession(session);
    set((state) => ({ sleepSessions: [session, ...state.sleepSessions] }));
  },

  removeSleepSession: async (id) => {
    await dbOps.deleteSleepSession(id);
    set((state) => ({ sleepSessions: state.sleepSessions.filter((s) => s.id !== id) }));
  },

  addPVTResult: async (result) => {
    await dbOps.savePVTResult(result);
    const updatedResults = [result, ...get().pvtResults];
    const progress = personalizationService.getProgress(updatedResults);

    let params = get().userParameters;
    if (personalizationService.isPersonalized(updatedResults)) {
      params = personalizationService.updateParameters(params, updatedResults);
      await SecureStore.setItemAsync('userParameters', JSON.stringify(params));
    }

    set({
      pvtResults: updatedResults,
      personalizationProgress: progress,
      userParameters: params,
    });
  },

  removePVTResult: async (id) => {
    await dbOps.deletePVTResult(id);
    set((state) => ({ pvtResults: state.pvtResults.filter((r) => r.id !== id) }));
  },

  addCaffeineIntake: async (intake) => {
    await dbOps.saveCaffeineIntake(intake);
    set((state) => ({ caffeineIntakes: [intake, ...state.caffeineIntakes] }));
  },

  removeCaffeineIntake: async (id) => {
    await dbOps.deleteCaffeineIntake(id);
    set((state) => ({ caffeineIntakes: state.caffeineIntakes.filter((i) => i.id !== id) }));
  },

  addCaffeinePreset: async (preset) => {
    await dbOps.saveCaffeinePreset(preset);
    set((state) => ({ caffeinePresets: [...state.caffeinePresets, preset] }));
  },

  removeCaffeinePreset: async (id) => {
    await dbOps.deleteCaffeinePreset(id);
    set((state) => ({ caffeinePresets: state.caffeinePresets.filter((p) => p.id !== id) }));
  },

  clearAllData: async () => {
    await dbOps.deleteAllData();
    await SecureStore.deleteItemAsync('userParameters');
    set({
      sleepSessions: [],
      pvtResults: [],
      caffeineIntakes: [],
      caffeinePresets: DEFAULT_CAFFEINE_PRESETS,
      userParameters: GROUP_AVERAGE_PARAMS,
      personalizationProgress: 0,
    });
  },
}));
