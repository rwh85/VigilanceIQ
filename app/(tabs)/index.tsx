import { ScrollView, StyleSheet } from 'react-native';
import { useAlertnessStore } from '../../src/stores/alertness-store';
import { useDataStore } from '../../src/stores/data-store';
import { AlertnessCard } from '../../src/components/AlertnessCard';
import { AlertnessChart } from '../../src/components/AlertnessChart';
import { PersonalizationProgress } from '../../src/components/PersonalizationProgress';
import { useThemeColors } from '../../src/theme';

export default function AlertnessTab() {
  const theme = useThemeColors();
  const { currentImpairment, currentBAC, prediction, hoursAwake } = useAlertnessStore();
  const { pvtResults } = useDataStore();

  const now = new Date();
  const startHour = now.getHours() + now.getMinutes() / 60;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <AlertnessCard impairmentMs={currentImpairment} bacEquivalence={currentBAC} hoursAwake={hoursAwake} />
      {prediction && <AlertnessChart prediction={prediction} startHourOfDay={startHour} />}
      <PersonalizationProgress testCount={pvtResults.length} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
