import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';
import { useAlertnessStore } from '../stores/alertness-store';
import { useAppStore } from '../stores/app-store';
import { useDataStore } from '../stores/data-store';
import { SleepWakeSchedule } from '../models/sleep-wake-schedule';

export function useAlertnessPrediction() {
  const updatePrediction = useAlertnessStore((s) => s.updatePrediction);
  const { sleepSessions, caffeineIntakes, userParameters } = useDataStore();
  const forecastDurationHours = useAppStore((s) => s.forecastDurationHours);

  const runPrediction = useCallback(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(0, 0, 0, 0);

    const schedule = SleepWakeSchedule.fromSleepSessions(sleepSessions, midnight);
    const currentHours = now.getHours() + now.getMinutes() / 60;
    const hoursAwake = schedule.hoursAwakeSince(currentHours, 0);

    updatePrediction(userParameters, caffeineIntakes, schedule, hoursAwake, forecastDurationHours);
  }, [sleepSessions, caffeineIntakes, userParameters, forecastDurationHours, updatePrediction]);

  useEffect(() => {
    runPrediction();
  }, [runPrediction]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        runPrediction();
      }
    });
    return () => sub.remove();
  }, [runPrediction]);
}
