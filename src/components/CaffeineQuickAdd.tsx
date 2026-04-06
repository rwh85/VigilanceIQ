import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CaffeinePreset } from '../models/types';
import { useThemeColors, spacing, radius } from '../theme';

interface CaffeineQuickAddProps {
  presets: CaffeinePreset[];
  onAdd: (preset: CaffeinePreset) => void;
}

export function CaffeineQuickAdd({ presets, onAdd }: CaffeineQuickAddProps) {
  const theme = useThemeColors();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {presets.map((preset) => (
        <Pressable
          key={preset.id}
          onPress={() => onAdd(preset)}
          style={[styles.button, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Ionicons name={preset.iconName as any} size={24} color={theme.accent} />
          <Text style={[styles.name, { color: theme.text }]}>{preset.name}</Text>
          <Text style={[styles.dose, { color: theme.textSecondary }]}>{preset.doseMg}mg</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.md, gap: spacing.sm },
  button: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    width: 90,
  },
  name: { fontSize: 12, fontWeight: '600', marginTop: spacing.xs, textAlign: 'center' },
  dose: { fontSize: 11, marginTop: 2 },
});
