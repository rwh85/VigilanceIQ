import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useDataStore } from '../src/stores/data-store';
import { useThemeColors, spacing } from '../src/theme';

export default function AddSleepScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const { addSleepSession } = useDataStore();

  // Default to last night: 11pm yesterday to 7am today
  const now = new Date();
  const [startDate] = useState(() => {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    d.setHours(23, 0, 0, 0);
    return d;
  });
  const [endDate] = useState(() => {
    const d = new Date(now);
    d.setHours(7, 0, 0, 0);
    return d;
  });

  const duration = (endDate.getTime() - startDate.getTime()) / 3600000;

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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Add Sleep Session</Text>
      <Text style={[styles.info, { color: theme.textSecondary }]}>
        {startDate.toLocaleString()} — {endDate.toLocaleString()}
      </Text>
      <Text style={[styles.duration, { color: theme.text }]}>{duration.toFixed(1)} hours</Text>

      <Pressable style={[styles.button, { backgroundColor: theme.accent }]} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </Pressable>
      <Pressable style={styles.cancel} onPress={() => router.back()}>
        <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  title: { fontSize: 24, fontWeight: '700', marginBottom: spacing.md },
  info: { fontSize: 14, textAlign: 'center', marginBottom: spacing.sm },
  duration: { fontSize: 48, fontWeight: '700', marginBottom: spacing.xl },
  button: { borderRadius: 14, paddingVertical: 16, paddingHorizontal: 48 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  cancel: { marginTop: spacing.md },
  cancelText: { fontSize: 16 },
});
