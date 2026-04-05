import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useAppStore } from '../../src/stores/app-store';
import { useDataStore } from '../../src/stores/data-store';
import { useThemeColors, spacing } from '../../src/theme';

function Stepper({
  value,
  display,
  onDecrement,
  onIncrement,
  accentColor,
}: {
  value: number;
  display: string;
  onDecrement: () => void;
  onIncrement: () => void;
  accentColor: string;
}) {
  return (
    <View style={styles.stepper}>
      <Pressable
        onPress={onDecrement}
        hitSlop={8}
        style={[styles.stepBtn, { borderColor: accentColor }]}
      >
        <Text style={[styles.stepBtnText, { color: accentColor }]}>−</Text>
      </Pressable>
      <Text style={[styles.stepValue, { color: accentColor }]}>{display}</Text>
      <Pressable
        onPress={onIncrement}
        hitSlop={8}
        style={[styles.stepBtn, { borderColor: accentColor }]}
      >
        <Text style={[styles.stepBtnText, { color: accentColor }]}>+</Text>
      </Pressable>
    </View>
  );
}

export default function SettingsTab() {
  const theme = useThemeColors();
  const {
    caffeineHalfLife,
    caffeineCutoffHour,
    maxDailyCaffeineMg,
    forecastDurationHours,
    setCaffeineHalfLife,
    setCaffeineCutoffHour,
    setMaxDailyCaffeine,
    setForecastDuration,
  } = useAppStore();
  const { pvtResults, personalizationProgress, clearAllData } = useDataStore();

  const handleClearData = () => {
    Alert.alert('Clear All Data', 'This will permanently delete all your data. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => clearAllData() },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.section, { color: theme.textSecondary }]}>MODEL</Text>
      <View style={[styles.row, { borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.text }]}>Total PVT Tests</Text>
        <Text style={[styles.value, { color: theme.textSecondary }]}>{pvtResults.length}</Text>
      </View>
      <View style={[styles.row, { borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.text }]}>Personalization</Text>
        <Text style={[styles.value, { color: theme.textSecondary }]}>{Math.round(personalizationProgress * 100)}%</Text>
      </View>

      <Text style={[styles.section, { color: theme.textSecondary }]}>CAFFEINE</Text>
      <View style={[styles.row, { borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.text }]}>Half-life</Text>
        <Stepper
          value={caffeineHalfLife}
          display={`${caffeineHalfLife.toFixed(1)}h`}
          onDecrement={() => setCaffeineHalfLife(Math.max(3.0, Math.round((caffeineHalfLife - 0.1) * 10) / 10))}
          onIncrement={() => setCaffeineHalfLife(Math.min(9.0, Math.round((caffeineHalfLife + 0.1) * 10) / 10))}
          accentColor={theme.accent}
        />
      </View>
      <View style={[styles.row, { borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.text }]}>Daily limit</Text>
        <Stepper
          value={maxDailyCaffeineMg}
          display={`${maxDailyCaffeineMg}mg`}
          onDecrement={() => setMaxDailyCaffeine(Math.max(100, maxDailyCaffeineMg - 50))}
          onIncrement={() => setMaxDailyCaffeine(Math.min(800, maxDailyCaffeineMg + 50))}
          accentColor={theme.accent}
        />
      </View>
      <View style={[styles.row, { borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.text }]}>Cutoff time</Text>
        <Stepper
          value={caffeineCutoffHour}
          display={`${caffeineCutoffHour}:00`}
          onDecrement={() => setCaffeineCutoffHour(Math.max(12, caffeineCutoffHour - 1))}
          onIncrement={() => setCaffeineCutoffHour(Math.min(22, caffeineCutoffHour + 1))}
          accentColor={theme.accent}
        />
      </View>

      <Text style={[styles.section, { color: theme.textSecondary }]}>FORECAST</Text>
      <View style={[styles.row, { borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.text }]}>Duration</Text>
        <Stepper
          value={forecastDurationHours}
          display={`${forecastDurationHours}h`}
          onDecrement={() => setForecastDuration(Math.max(12, forecastDurationHours - 4))}
          onIncrement={() => setForecastDuration(Math.min(72, forecastDurationHours + 4))}
          accentColor={theme.accent}
        />
      </View>

      <Pressable style={styles.danger} onPress={handleClearData}>
        <Text style={styles.dangerText}>Clear All Data</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginTop: spacing.lg, marginBottom: spacing.xs, paddingHorizontal: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: spacing.md, borderBottomWidth: 1 },
  label: { fontSize: 16 },
  value: { fontSize: 16 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepBtn: { width: 28, height: 28, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 18, lineHeight: 22, fontWeight: '500' },
  stepValue: { fontSize: 15, fontWeight: '500', minWidth: 52, textAlign: 'center' },
  danger: { marginTop: spacing.xl, marginHorizontal: spacing.md, padding: spacing.md, borderRadius: 12, backgroundColor: '#fee2e2', alignItems: 'center' },
  dangerText: { color: '#ef4444', fontWeight: '600', fontSize: 16 },
});
