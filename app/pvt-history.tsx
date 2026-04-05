import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useDataStore } from '../src/stores/data-store';
import { useThemeColors, spacing } from '../src/theme';
import { getPerformanceLevel, PERFORMANCE_COLORS } from '../src/models/types';

export default function PVTHistoryScreen() {
  const router = useRouter();
  const theme = useThemeColors();
  const { pvtResults } = useDataStore();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.accent }]}>‹ Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>PVT History</Text>
        <View style={styles.backButton} />
      </View>

      <FlatList
        data={pvtResults}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const meanRT = item.reactionTimes.reduce((a: number, b: number) => a + b, 0) / item.reactionTimes.length;
          const level = getPerformanceLevel(meanRT);
          const fastest = Math.min(...item.reactionTimes);
          const slowest = Math.max(...item.reactionTimes);
          return (
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.meanRT, { color: PERFORMANCE_COLORS[level] }]}>{Math.round(meanRT)} ms</Text>
                <Text style={[styles.date, { color: theme.textSecondary }]}>
                  {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={styles.stats}>
                <Text style={[styles.stat, { color: theme.textSecondary }]}>Trials: {item.reactionTimes.length}</Text>
                <Text style={[styles.stat, { color: theme.textSecondary }]}>Fastest: {Math.round(fastest)} ms</Text>
                <Text style={[styles.stat, { color: theme.textSecondary }]}>Slowest: {Math.round(slowest)} ms</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.textSecondary }]}>No PVT tests recorded yet.</Text>
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
  card: { borderRadius: 12, padding: spacing.md, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  meanRT: { fontSize: 22, fontWeight: '700' },
  date: { fontSize: 12 },
  stats: { flexDirection: 'row', gap: spacing.md },
  stat: { fontSize: 13 },
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
