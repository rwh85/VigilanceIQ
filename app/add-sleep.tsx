import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useDataStore } from '../src/stores/data-store';
import { useAlertnessStore } from '../src/stores/alertness-store';
import { useAppStore } from '../src/stores/app-store';
import { SleepQuality, SleepSession } from '../src/models/types';
import { SleepWakeSchedule } from '../src/models/sleep-wake-schedule';
import { useThemeColors, spacing } from '../src/theme';
import healthService from '../src/services/health/health-service';

const QUALITY_LABELS: Record<number, { label: string; quality: SleepQuality }> = {
  1: { label: 'Very Poor', quality: 'poor' },
  2: { label: 'Poor', quality: 'poor' },
  3: { label: 'Fair', quality: 'fair' },
  4: { label: 'Good', quality: 'good' },
  5: { label: 'Excellent', quality: 'excellent' },
};

export default function AddSleepScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const { addSleepSession, sleepSessions, caffeineIntakes, userParameters } = useDataStore();
  const { updatePrediction } = useAlertnessStore();
  const forecastDurationHours = useAppStore((s) => s.forecastDurationHours);

  const now = new Date();

  const [startDate, setStartDate] = useState(() => {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    d.setHours(23, 0, 0, 0);
    return d;
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date(now);
    d.setHours(7, 0, 0, 0);
    return d;
  });
  const [qualityStars, setQualityStars] = useState(4);

  const [activeField, setActiveField] = useState<'start' | 'end' | null>(null);
  const [androidStep, setAndroidStep] = useState<'date' | 'time'>('date');
  const [androidPendingDate, setAndroidPendingDate] = useState<Date>(new Date());

  // Health sync state
  const [healthPermission, setHealthPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [loadingHealth, setLoadingHealth] = useState(false);
  const platformLabel = Platform.OS === 'ios' ? 'Apple Health' : 'Health Connect';

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    setLoadingHealth(true);
    try {
      const granted = await healthService.requestPermissions();
      setHealthPermission(granted ? 'granted' : 'denied');
      if (!granted) return;

      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sessions = await healthService.getSleepSessions(sevenDaysAgo, now);

      if (sessions.length > 0) {
        const latest = sessions.sort((a: { startDate: Date }, b: { startDate: Date }) => b.startDate.getTime() - a.startDate.getTime())[0];
        setStartDate(latest.startDate);
        setEndDate(latest.endDate);
      }
    } catch {
      // Health data load failed — keep defaults
    } finally {
      setLoadingHealth(false);
    }
  };

  const duration = (endDate.getTime() - startDate.getTime()) / 3600000;

  const openPicker = (field: 'start' | 'end') => {
    const current = field === 'start' ? startDate : endDate;
    if (Platform.OS === 'android') {
      setAndroidPendingDate(new Date(current));
      setAndroidStep('date');
    }
    setActiveField(field);
  };

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'ios') {
      if (selected && activeField) {
        if (activeField === 'start') setStartDate(new Date(selected));
        else setEndDate(new Date(selected));
      }
    } else {
      if (event.type === 'dismissed') {
        setActiveField(null);
        return;
      }
      if (!selected) return;

      if (androidStep === 'date') {
        const prev = activeField === 'start' ? startDate : endDate;
        const merged = new Date(selected);
        merged.setHours(prev.getHours(), prev.getMinutes(), 0, 0);
        setAndroidPendingDate(merged);
        setAndroidStep('time');
      } else {
        const merged = new Date(androidPendingDate);
        merged.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
        if (activeField === 'start') setStartDate(merged);
        else setEndDate(merged);
        setActiveField(null);
      }
    }
  };

  const handleSave = async () => {
    const session: SleepSession = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      startDate,
      endDate,
      source: 'manual',
      quality: QUALITY_LABELS[qualityStars].quality,
    };

    await addSleepSession(session);

    // Write to health platform
    if (healthPermission === 'granted') {
      setSyncStatus('syncing');
      try {
        await healthService.writeSleepSession(session);
        setSyncStatus('synced');
      } catch {
        setSyncStatus('error');
      }
    }

    // Recalculate alertness prediction immediately
    const updatedSessions = [session, ...sleepSessions];
    const midnight = new Date(now);
    midnight.setHours(0, 0, 0, 0);
    const schedule = SleepWakeSchedule.fromSleepSessions(updatedSessions, midnight);
    const currentHour = now.getHours() + now.getMinutes() / 60;
    const hoursAwake = schedule.hoursAwakeSince(currentHour, 0);
    updatePrediction(userParameters, caffeineIntakes, schedule, hoursAwake, forecastDurationHours);

    router.back();
  };

  const fmt = (d: Date) =>
    d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  const pickerValue =
    Platform.OS === 'android' && androidStep === 'time'
      ? androidPendingDate
      : activeField === 'start'
      ? startDate
      : endDate;

  const isValid = duration > 0 && endDate <= now;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: theme.text }]}>Add Sleep Session</Text>

      {/* Health sync status */}
      {loadingHealth && (
        <View style={styles.syncRow}>
          <ActivityIndicator size="small" color={theme.accent} />
          <Text style={[styles.syncText, { color: theme.textSecondary }]}>
            Loading from {platformLabel}…
          </Text>
        </View>
      )}
      {!loadingHealth && healthPermission === 'denied' && (
        <View style={[styles.syncBanner, { backgroundColor: theme.surface }]}>
          <Text style={[styles.syncText, { color: theme.textSecondary }]}>
            Enable {platformLabel} access in Settings to sync sleep data.
          </Text>
        </View>
      )}
      {!loadingHealth && healthPermission === 'granted' && syncStatus === 'idle' && (
        <View style={styles.syncRow}>
          <Text style={[styles.syncText, { color: theme.textSecondary }]}>
            Pre-filled from {platformLabel}
          </Text>
        </View>
      )}
      {syncStatus === 'synced' && (
        <View style={styles.syncRow}>
          <Text style={[styles.syncText, { color: '#22c55e' }]}>
            Synced with {platformLabel}
          </Text>
        </View>
      )}
      {syncStatus === 'error' && (
        <View style={styles.syncRow}>
          <Text style={[styles.syncText, { color: '#f97316' }]}>
            Could not sync with {platformLabel}
          </Text>
        </View>
      )}

      {/* Sleep Start */}
      <Pressable
        style={[styles.fieldRow, { borderColor: activeField === 'start' ? theme.accent : theme.border }]}
        onPress={() => openPicker('start')}
      >
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Sleep Start</Text>
        <Text style={[styles.fieldValue, { color: theme.accent }]}>{fmt(startDate)}</Text>
      </Pressable>

      {/* Sleep End */}
      <Pressable
        style={[styles.fieldRow, { borderColor: activeField === 'end' ? theme.accent : theme.border }]}
        onPress={() => openPicker('end')}
      >
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Sleep End</Text>
        <Text style={[styles.fieldValue, { color: theme.accent }]}>{fmt(endDate)}</Text>
      </Pressable>

      {/* Inline picker (iOS) or modal picker (Android) */}
      {activeField !== null && (
        <DateTimePicker
          value={pickerValue}
          mode={Platform.OS === 'android' ? androidStep : 'datetime'}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          maximumDate={now}
        />
      )}

      {Platform.OS === 'ios' && activeField !== null && (
        <Pressable
          style={[styles.doneButton, { backgroundColor: theme.surface }]}
          onPress={() => setActiveField(null)}
        >
          <Text style={[styles.doneText, { color: theme.accent }]}>Done</Text>
        </Pressable>
      )}

      <Text style={[styles.duration, { color: theme.text }]}>
        {duration > 0 ? `${duration.toFixed(1)}h` : '—'}
      </Text>

      {/* Sleep Quality Rating */}
      <Text style={[styles.qualityTitle, { color: theme.text }]}>Sleep Quality</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable key={star} onPress={() => setQualityStars(star)} hitSlop={8}>
            <Text style={[styles.star, { color: star <= qualityStars ? theme.accent : theme.border }]}>
              ★
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={[styles.qualityLabel, { color: theme.textSecondary }]}>
        {qualityStars} — {QUALITY_LABELS[qualityStars].label}
      </Text>

      <Pressable
        style={[styles.button, { backgroundColor: theme.accent }, !isValid && styles.disabled]}
        onPress={handleSave}
        disabled={!isValid}
      >
        <Text style={styles.buttonText}>Save</Text>
      </Pressable>

      <Pressable style={styles.cancel} onPress={() => router.back()}>
        <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', padding: spacing.xl, paddingTop: spacing.xl * 2 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: spacing.lg },
  syncRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  syncBanner: { width: '100%', borderRadius: 10, padding: spacing.sm, marginBottom: spacing.sm },
  syncText: { fontSize: 13 },
  fieldRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  fieldLabel: { fontSize: 14 },
  fieldValue: { fontSize: 16, fontWeight: '600' },
  doneButton: { alignSelf: 'flex-end', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 8, marginBottom: spacing.sm },
  doneText: { fontSize: 16, fontWeight: '600' },
  duration: { fontSize: 48, fontWeight: '700', marginVertical: spacing.lg },
  qualityTitle: { fontSize: 16, fontWeight: '600', marginBottom: spacing.sm },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  star: { fontSize: 36 },
  qualityLabel: { fontSize: 13, marginBottom: spacing.lg },
  button: { borderRadius: 14, paddingVertical: 16, paddingHorizontal: 48, marginBottom: spacing.sm },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  disabled: { opacity: 0.4 },
  cancel: { marginTop: spacing.sm },
  cancelText: { fontSize: 16 },
});
