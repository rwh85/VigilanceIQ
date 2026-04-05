import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useDataStore } from '../src/stores/data-store';
import { useThemeColors, spacing } from '../src/theme';

export default function AddSleepScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const { addSleepSession } = useDataStore();

  const now = new Date();

  // Default to last night: 11pm yesterday to 7am today — both mutable
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

  // Which field is the picker editing right now
  const [activeField, setActiveField] = useState<'start' | 'end' | null>(null);
  // Android requires two passes: date then time
  const [androidStep, setAndroidStep] = useState<'date' | 'time'>('date');
  const [androidPendingDate, setAndroidPendingDate] = useState<Date>(new Date());

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
      // Android: picker fires once with type "set" or "dismissed"
      if (event.type === 'dismissed') {
        setActiveField(null);
        return;
      }
      if (!selected) return;

      if (androidStep === 'date') {
        // Preserve existing hour/minute while swapping the calendar date
        const prev = activeField === 'start' ? startDate : endDate;
        const merged = new Date(selected);
        merged.setHours(prev.getHours(), prev.getMinutes(), 0, 0);
        setAndroidPendingDate(merged);
        setAndroidStep('time');
        // picker will re-render in 'time' mode
      } else {
        // Merge the chosen time into the pending date
        const merged = new Date(androidPendingDate);
        merged.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
        if (activeField === 'start') setStartDate(merged);
        else setEndDate(merged);
        setActiveField(null);
      }
    }
  };

  const handleSave = async () => {
    await addSleepSession({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      startDate,
      endDate,
      source: 'manual',
      quality: 'good',
    });
    router.back();
  };

  const fmt = (d: Date) =>
    d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  // The value the picker should display
  const pickerValue =
    Platform.OS === 'android' && androidStep === 'time'
      ? androidPendingDate
      : activeField === 'start'
      ? startDate
      : endDate;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: theme.text }]}>Add Sleep Session</Text>

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

      {/* Done button to dismiss iOS spinner */}
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

      <Pressable
        style={[styles.button, { backgroundColor: theme.accent }, duration <= 0 && styles.disabled]}
        onPress={handleSave}
        disabled={duration <= 0}
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
  button: { borderRadius: 14, paddingVertical: 16, paddingHorizontal: 48, marginBottom: spacing.sm },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  disabled: { opacity: 0.4 },
  cancel: { marginTop: spacing.sm },
  cancelText: { fontSize: 16 },
});
