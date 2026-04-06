import { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, TextInput, ScrollView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useDataStore } from '../src/stores/data-store';
import { useThemeColors, spacing, radius } from '../src/theme';
import { CaffeineSource, CAFFEINE_SOURCE_LABELS } from '../src/models/types';

const ALL_SOURCES: CaffeineSource[] = ['coffee', 'espresso', 'tea', 'energyDrink', 'soda', 'preworkout', 'pill', 'custom'];

const SOURCE_ICONS: Record<CaffeineSource, string> = {
  coffee: 'cafe-outline',
  espresso: 'cafe',
  tea: 'leaf-outline',
  energyDrink: 'flash-outline',
  soda: 'water-outline',
  preworkout: 'barbell-outline',
  pill: 'medical-outline',
  custom: 'add-circle-outline',
};

export default function CaffeinePresetsScreen() {
  const router = useRouter();
  const theme = useThemeColors();
  const { caffeinePresets, addCaffeinePreset, removeCaffeinePreset } = useDataStore();

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDose, setNewDose] = useState('');
  const [newSource, setNewSource] = useState<CaffeineSource>('custom');

  const handleAdd = () => {
    const dose = parseFloat(newDose);
    if (!newName.trim() || isNaN(dose) || dose <= 0) return;
    addCaffeinePreset({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      name: newName.trim(),
      doseMg: dose,
      iconName: SOURCE_ICONS[newSource],
      sortOrder: caffeinePresets.length,
      source: newSource,
    });
    setNewName('');
    setNewDose('');
    setNewSource('custom');
    setShowAdd(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.accent }]}>‹ Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Caffeine Presets</Text>
        <Pressable onPress={() => setShowAdd(true)} style={styles.backButton}>
          <Text style={[styles.addText, { color: theme.accent }]}>+ Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={caffeinePresets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.info}>
              <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.dose, { color: theme.textSecondary }]}>
                {item.doseMg} mg · {CAFFEINE_SOURCE_LABELS[item.source]}
              </Text>
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

      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sheetTitle, { color: theme.text }]}>Add Preset</Text>

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="Name (e.g. Cold Brew)"
              placeholderTextColor={theme.textSecondary}
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="Caffeine (mg)"
              placeholderTextColor={theme.textSecondary}
              value={newDose}
              onChangeText={setNewDose}
              keyboardType="numeric"
            />

            <Text style={[styles.label, { color: theme.textSecondary }]}>Beverage type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sourceScroll}>
              {ALL_SOURCES.map((src) => (
                <Pressable
                  key={src}
                  onPress={() => setNewSource(src)}
                  style={[
                    styles.sourceChip,
                    { borderColor: theme.border, backgroundColor: theme.background },
                    newSource === src && { borderColor: theme.accent, backgroundColor: theme.accent + '22' },
                  ]}
                >
                  <Text style={[styles.sourceChipText, { color: newSource === src ? theme.accent : theme.text }]}>
                    {CAFFEINE_SOURCE_LABELS[src]}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.sheetActions}>
              <Pressable onPress={() => setShowAdd(false)} style={[styles.actionBtn, { borderColor: theme.border }]}>
                <Text style={[styles.actionBtnText, { color: theme.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleAdd} style={[styles.actionBtn, { borderColor: theme.accent, backgroundColor: theme.accent }]}>
                <Text style={[styles.actionBtnText, { color: '#fff' }]}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1 },
  backButton: { width: 60 },
  backText: { fontSize: 18 },
  addText: { fontSize: 16, fontWeight: '600', textAlign: 'right' },
  title: { fontSize: 18, fontWeight: '700' },
  list: { padding: spacing.md, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: radius.md, padding: spacing.md, borderWidth: 1 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600' },
  dose: { fontSize: 14, marginTop: 2 },
  deleteButton: { paddingHorizontal: spacing.sm },
  deleteText: { fontSize: 14, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: spacing.xl },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg, gap: spacing.md },
  sheetTitle: { fontSize: 18, fontWeight: '700', marginBottom: spacing.sm },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 16 },
  label: { fontSize: 13, fontWeight: '500' },
  sourceScroll: { flexGrow: 0 },
  sourceChip: { borderWidth: 1, borderRadius: radius.xl, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginRight: spacing.sm },
  sourceChipText: { fontSize: 13, fontWeight: '500' },
  sheetActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  actionBtn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  actionBtnText: { fontSize: 16, fontWeight: '600' },
});
