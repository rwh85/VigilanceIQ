import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors, spacing } from '../theme';
import { Constants } from '../models/constants';

interface PersonalizationProgressProps {
  testCount: number;
}

export function PersonalizationProgress({ testCount }: PersonalizationProgressProps) {
  const theme = useThemeColors();
  const target = Constants.Model.minTestsForPersonalization;
  const progress = Math.min(1, testCount / target);
  const isComplete = testCount >= target;

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        {isComplete ? 'Fully Personalized' : 'Personalization Progress'}
      </Text>
      <View style={[styles.barBg, { backgroundColor: theme.border }]}>
        <View
          style={[styles.barFill, { width: `${progress * 100}%`, backgroundColor: isComplete ? '#22c55e' : '#3b82f6' }]}
        />
      </View>
      <Text style={[styles.count, { color: theme.textSecondary }]}>
        {testCount} / {target} tests
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 12, padding: spacing.md, borderWidth: 1, marginHorizontal: spacing.md, marginVertical: spacing.sm },
  title: { fontSize: 14, fontWeight: '600', marginBottom: spacing.sm },
  barBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  count: { fontSize: 12, marginTop: spacing.xs },
});
