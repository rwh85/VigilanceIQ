import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useDataStore } from '../src/stores/data-store';
import { useThemeColors, spacing, radius } from '../src/theme';

export default function CaffeineOptimizerScreen() {
  const router = useRouter();
  const theme = useThemeColors();
  const { caffeineIntakes } = useDataStore();

  const todayIntakes = caffeineIntakes.filter((i) => {
    const today = new Date();
    return i.timestamp.toDateString() === today.toDateString();
  });
  const totalMg = todayIntakes.reduce((sum, i) => sum + i.doseMg, 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.accent }]}>‹ Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Caffeine Optimizer</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>Today's Total</Text>
          <Text style={[styles.totalMg, { color: theme.text }]}>{totalMg} mg</Text>
          <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
            {totalMg < 200 ? 'Within optimal range' : totalMg < 400 ? 'Moderate intake' : 'High intake — consider spacing doses'}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>Recommendation</Text>
          <Text style={[styles.bodyText, { color: theme.text }]}>
            Keep caffeine intake under 400 mg/day. Avoid caffeine within 6 hours of your target bedtime to minimize sleep disruption.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>Today's Doses</Text>
          {todayIntakes.length === 0 ? (
            <Text style={[styles.empty, { color: theme.textSecondary }]}>No caffeine logged today.</Text>
          ) : (
            todayIntakes.map((intake) => (
              <View key={intake.id} style={[styles.row, { borderBottomColor: theme.border }]}>
                <Text style={[styles.doseText, { color: theme.text }]}>{intake.doseMg} mg</Text>
                <Text style={[styles.timeText, { color: theme.textSecondary }]}>
                  {intake.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1 },
  backButton: { width: 60 },
  backText: { fontSize: 18 },
  title: { fontSize: 18, fontWeight: '700' },
  content: { padding: spacing.md, gap: spacing.md },
  card: { borderRadius: radius.md, padding: spacing.md, borderWidth: 1 },
  cardTitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  totalMg: { fontSize: 40, fontWeight: '700', marginBottom: spacing.xs },
  cardSub: { fontSize: 14 },
  bodyText: { fontSize: 15, lineHeight: 22 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1 },
  doseText: { fontSize: 16, fontWeight: '600' },
  timeText: { fontSize: 14 },
  empty: { fontSize: 14, textAlign: 'center', paddingVertical: spacing.sm },
});
