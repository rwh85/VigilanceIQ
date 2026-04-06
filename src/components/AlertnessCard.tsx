import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors, spacing } from '../theme';
import { getPerformanceLevel, reactionTimeToAlertness, PERFORMANCE_COLORS, PERFORMANCE_LABELS } from '../models/types';

interface AlertnessCardProps {
  impairmentMs: number;
  bacEquivalence: number;
  hoursAwake: number;
}

export function AlertnessCard({ impairmentMs, bacEquivalence, hoursAwake }: AlertnessCardProps) {
  const theme = useThemeColors();
  const level = getPerformanceLevel(impairmentMs);
  const color = PERFORMANCE_COLORS[level];
  const label = PERFORMANCE_LABELS[level];
  const alertnessScore = reactionTimeToAlertness(impairmentMs);

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.text }]}>Current Alertness</Text>
      <Text
        style={[styles.scoreValue, { color }]}
        accessibilityLabel={`Current alertness score: ${alertnessScore.toFixed(1)} out of 10`}
      >
        {alertnessScore.toFixed(1)}
      </Text>
      <Text style={[styles.msSecondary, { color: theme.textSecondary }]}>
        ({Math.round(impairmentMs)} ms)
      </Text>
      <Text style={[styles.label, { color }]}>{label}</Text>
      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>BAC Equiv.</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>{bacEquivalence.toFixed(3)}%</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Hours Awake</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>{hoursAwake.toFixed(1)}h</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  title: { fontSize: 14, fontWeight: '600', marginBottom: spacing.sm },
  scoreValue: { fontSize: 48, fontWeight: '700' },
  msSecondary: { fontSize: 14, marginBottom: spacing.xs },
  label: { fontSize: 16, marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statLabel: { fontSize: 12 },
  statValue: { fontSize: 18, fontWeight: '600' },
});
