import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { usePVTTest } from '../src/hooks/usePVTTest';
import { useDataStore } from '../src/stores/data-store';
import { PERFORMANCE_COLORS } from '../src/models/types';
import * as Haptics from 'expo-haptics';

export default function PVTTestScreen() {
  const router = useRouter();
  const { engine, showStimulus, remainingSeconds, startTest, handleTap, resetTest } = usePVTTest(60);
  const { addPVTResult } = useDataStore();

  const onTap = () => {
    handleTap();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const saveAndExit = async () => {
    if (engine.reactionTimes.length > 0) {
      await addPVTResult({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        timestamp: new Date(),
        reactionTimes: engine.reactionTimes,
        durationSeconds: engine.durationSeconds,
        isBaseline: false,
      });
    }
    router.back();
  };

  if (!engine.isActive && !engine.isComplete) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>PVT Test</Text>
        <Text style={styles.subtitle}>Tap when you see the stimulus</Text>
        <Pressable style={styles.button} onPress={startTest}>
          <Text style={styles.buttonText}>Start 60s Test</Text>
        </Pressable>
        <Pressable style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    );
  }

  if (engine.isComplete) {
    const color = PERFORMANCE_COLORS[engine.performanceLevel];
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Results</Text>
        <Text style={[styles.bigRT, { color }]}>{Math.round(engine.meanRT)} ms</Text>
        <Text style={styles.subtitle}>{engine.reactionTimes.length} trials</Text>
        <Text style={styles.stat}>Fastest: {Math.round(engine.fastestRT)} ms</Text>
        <Text style={styles.stat}>Slowest: {Math.round(engine.slowestRT)} ms</Text>
        <Text style={styles.stat}>Lapses: {engine.lapseCount}</Text>
        {engine.maxCombo >= 2 && <Text style={styles.stat}>Max Combo: {engine.maxCombo}x</Text>}
        <Pressable style={styles.button} onPress={saveAndExit}>
          <Text style={styles.buttonText}>Save & Exit</Text>
        </Pressable>
      </View>
    );
  }

  // Active test
  return (
    <Pressable style={[styles.fullScreen, showStimulus && styles.stimulus]} onPress={onTap}>
      <Text style={styles.timer}>{remainingSeconds}s</Text>
      {showStimulus && <View style={styles.dot} />}
      {engine.comboLabel !== '' && <Text style={styles.combo}>{engine.comboLabel}</Text>}
      {engine.reactionTimes.length > 0 && !showStimulus && (
        <Text style={styles.lastRT}>{Math.round(engine.reactionTimes[engine.reactionTimes.length - 1])} ms</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', padding: 32 },
  fullScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  stimulus: { backgroundColor: '#111' },
  title: { color: '#fff', fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#9ca3af', fontSize: 16, marginBottom: 32 },
  button: { backgroundColor: '#2563eb', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 48, marginTop: 24 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  cancelButton: { marginTop: 16 },
  cancelText: { color: '#6b7280', fontSize: 16 },
  timer: { color: '#374151', fontSize: 20, position: 'absolute', top: 60 },
  dot: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#22c55e' },
  combo: { color: '#facc15', fontSize: 24, fontWeight: '700', position: 'absolute', bottom: 120 },
  lastRT: { color: '#6b7280', fontSize: 18, position: 'absolute', bottom: 80 },
  bigRT: { fontSize: 64, fontWeight: '700' },
  stat: { color: '#9ca3af', fontSize: 16, marginTop: 4 },
});
