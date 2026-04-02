import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useDataStore } from '../../src/stores/data-store';
import { CaffeineQuickAdd } from '../../src/components/CaffeineQuickAdd';
import { useThemeColors, spacing } from '../../src/theme';
import { CaffeinePreset } from '../../src/models/types';

export default function CaffeineTab() {
  const theme = useThemeColors();
  const router = useRouter();
  const { caffeineIntakes, caffeinePresets, addCaffeineIntake } = useDataStore();

  const handleQuickAdd = (preset: CaffeinePreset) => {
    const now = new Date();
    addCaffeineIntake({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      timeHour: now.getHours() + now.getMinutes() / 60,
      timestamp: now,
      doseMg: preset.doseMg,
      source: 'coffee',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Add</Text>
      <CaffeineQuickAdd presets={caffeinePresets} onAdd={handleQuickAdd} />

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Intake</Text>
      <FlatList
        data={caffeineIntakes.slice(0, 20)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.row, { borderColor: theme.border }]}>
            <Text style={[styles.dose, { color: theme.text }]}>{item.doseMg}mg</Text>
            <Text style={[styles.time, { color: theme.textSecondary }]}>
              {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={[styles.empty, { color: theme.textSecondary }]}>No caffeine logged today</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginHorizontal: spacing.md, marginTop: spacing.md, marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderBottomWidth: 1 },
  dose: { fontSize: 18, fontWeight: '600' },
  time: { fontSize: 14 },
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
