import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAlertnessStore } from '../../src/stores/alertness-store';
import { useDataStore } from '../../src/stores/data-store';
import { useAlertnessPrediction } from '../../src/hooks/useAlertnessPrediction';
import { AlertnessCard } from '../../src/components/AlertnessCard';
import { AlertnessChart } from '../../src/components/AlertnessChart';
import { PersonalizationProgress } from '../../src/components/PersonalizationProgress';
import { useThemeColors, spacing } from '../../src/theme';

export default function AlertnessTab() {
  const theme = useThemeColors();
  const router = useRouter();
  useAlertnessPrediction();
  const { currentImpairment, currentBAC, prediction, hoursAwake } = useAlertnessStore();
  const { pvtResults } = useDataStore();

  const now = new Date();
  const startHour = now.getHours() + now.getMinutes() / 60;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <AlertnessCard impairmentMs={currentImpairment} bacEquivalence={currentBAC} hoursAwake={hoursAwake} />
      {prediction && <AlertnessChart prediction={prediction} startHourOfDay={startHour} />}
      <Pressable
        style={[styles.napAdvisorBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => router.push('/nap' as never)}
      >
        <Ionicons name="moon-outline" size={20} color="#818cf8" />
        <Text style={styles.napAdvisorText}>Nap Advisor</Text>
        <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} style={{ marginLeft: 'auto' }} />
      </Pressable>
      <PersonalizationProgress testCount={pvtResults.length} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  napAdvisorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  napAdvisorText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#818cf8',
  },
});
