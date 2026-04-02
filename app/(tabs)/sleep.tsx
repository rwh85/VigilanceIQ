import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useDataStore } from '../../src/stores/data-store';
import { useThemeColors, spacing } from '../../src/theme';

export default function SleepTab() {
  const theme = useThemeColors();
  const router = useRouter();
  const { sleepSessions } = useDataStore();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Pressable style={[styles.addButton, { backgroundColor: theme.accent }]} onPress={() => router.push('/add-sleep')}>
        <Text style={styles.addText}>+ Add Sleep Session</Text>
      </Pressable>

      <FlatList
        data={sleepSessions.slice(0, 30)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const duration = (item.endDate.getTime() - item.startDate.getTime()) / 3600000;
          return (
            <View style={[styles.row, { borderColor: theme.border }]}>
              <View>
                <Text style={[styles.duration, { color: theme.text }]}>{duration.toFixed(1)}h</Text>
                <Text style={[styles.dates, { color: theme.textSecondary }]}>
                  {item.startDate.toLocaleDateString()} — {item.source}
                </Text>
              </View>
              {item.quality && <Text style={[styles.quality, { color: theme.textSecondary }]}>{item.quality}</Text>}
            </View>
          );
        }}
        ListEmptyComponent={<Text style={[styles.empty, { color: theme.textSecondary }]}>No sleep data yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.md },
  addButton: { marginHorizontal: spacing.md, borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  addText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderBottomWidth: 1 },
  duration: { fontSize: 20, fontWeight: '700' },
  dates: { fontSize: 12, marginTop: 2 },
  quality: { fontSize: 14 },
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
