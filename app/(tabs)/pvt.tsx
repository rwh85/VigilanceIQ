import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useDataStore } from '../../src/stores/data-store';
import { useThemeColors, spacing } from '../../src/theme';
import { getPerformanceLevel, PERFORMANCE_COLORS } from '../../src/models/types';

export default function PVTTab() {
  const theme = useThemeColors();
  const router = useRouter();
  const { pvtResults } = useDataStore();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Pressable style={[styles.startButton, { backgroundColor: theme.accent }]} onPress={() => router.push('/pvt-test')}>
        <Text style={styles.startText}>Start PVT Test</Text>
      </Pressable>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Results</Text>
      <FlatList
        data={pvtResults.slice(0, 20)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const meanRT = item.reactionTimes.reduce((a: number, b: number) => a + b, 0) / item.reactionTimes.length;
          const level = getPerformanceLevel(meanRT);
          return (
            <View style={[styles.resultRow, { borderColor: theme.border }]}>
              <View>
                <Text style={[styles.resultRT, { color: PERFORMANCE_COLORS[level] }]}>{Math.round(meanRT)} ms</Text>
                <Text style={[styles.resultDate, { color: theme.textSecondary }]}>
                  {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Text style={[styles.trialCount, { color: theme.textSecondary }]}>{item.reactionTimes.length} trials</Text>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={[styles.empty, { color: theme.textSecondary }]}>No tests yet. Start your first PVT test!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.md },
  startButton: { marginHorizontal: spacing.md, borderRadius: 14, padding: spacing.lg, alignItems: 'center' },
  startText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginHorizontal: spacing.md, marginTop: spacing.lg, marginBottom: spacing.sm },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderBottomWidth: 1 },
  resultRT: { fontSize: 20, fontWeight: '700' },
  resultDate: { fontSize: 12, marginTop: 2 },
  trialCount: { fontSize: 14 },
  empty: { textAlign: 'center', marginTop: spacing.xl, paddingHorizontal: spacing.lg },
});
