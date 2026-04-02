import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useAppStore } from '../../src/stores/app-store';
import { useDataStore } from '../../src/stores/data-store';
import { useThemeColors, spacing } from '../../src/theme';

export default function SettingsTab() {
  const theme = useThemeColors();
  const { caffeineHalfLife, caffeineCutoffHour, maxDailyCaffeineMg, forecastDurationHours } = useAppStore();
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
        <Text style={[styles.value, { color: theme.textSecondary }]}>{caffeineHalfLife}h</Text>
      </View>
      <View style={[styles.row, { borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.text }]}>Daily limit</Text>
        <Text style={[styles.value, { color: theme.textSecondary }]}>{maxDailyCaffeineMg}mg</Text>
      </View>
      <View style={[styles.row, { borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.text }]}>Cutoff time</Text>
        <Text style={[styles.value, { color: theme.textSecondary }]}>{caffeineCutoffHour}:00</Text>
      </View>

      <Text style={[styles.section, { color: theme.textSecondary }]}>FORECAST</Text>
      <View style={[styles.row, { borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.text }]}>Duration</Text>
        <Text style={[styles.value, { color: theme.textSecondary }]}>{forecastDurationHours}h</Text>
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
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: spacing.md, borderBottomWidth: 1 },
  label: { fontSize: 16 },
  value: { fontSize: 16 },
  danger: { marginTop: spacing.xl, marginHorizontal: spacing.md, padding: spacing.md, borderRadius: 12, backgroundColor: '#fee2e2', alignItems: 'center' },
  dangerText: { color: '#ef4444', fontWeight: '600', fontSize: 16 },
});
