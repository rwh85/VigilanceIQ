import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useDataStore } from '../src/stores/data-store';
import { useThemeColors, spacing } from '../src/theme';

export default function CaffeinePresetsScreen() {
  const router = useRouter();
  const theme = useThemeColors();
  const { caffeinePresets, removeCaffeinePreset } = useDataStore();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.accent }]}>‹ Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Caffeine Presets</Text>
        <View style={styles.backButton} />
      </View>

      <FlatList
        data={caffeinePresets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.info}>
              <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.dose, { color: theme.textSecondary }]}>{item.doseMg} mg</Text>
            </View>
            {!item.id.startsWith('default-') && (
              <Pressable onPress={() => removeCaffeinePreset(item.id)} style={styles.deleteButton}>
                <Text style={[styles.deleteText, { color: theme.danger }]}>Remove</Text>
              </Pressable>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.textSecondary }]}>No presets configured.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1 },
  backButton: { width: 60 },
  backText: { fontSize: 18 },
  title: { fontSize: 18, fontWeight: '700' },
  list: { padding: spacing.md, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, padding: spacing.md, borderWidth: 1 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600' },
  dose: { fontSize: 14, marginTop: 2 },
  deleteButton: { paddingHorizontal: spacing.sm },
  deleteText: { fontSize: 14, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
