import { View, Text, Pressable, StyleSheet, Share, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { usePVTTest } from '../src/hooks/usePVTTest';
import { useDataStore } from '../src/stores/data-store';
import { PERFORMANCE_COLORS, PERFORMANCE_LABELS } from '../src/models/types';
import * as Haptics from 'expo-haptics';

function getAlertnessScore(meanRT: number): number {
  if (meanRT < 300) return 10;
  if (meanRT < 360) return 9;
  if (meanRT < 380) return 8;
  if (meanRT < 400) return 7;
  if (meanRT < 430) return 6;
  if (meanRT < 467) return 5;
  if (meanRT < 500) return 4;
  if (meanRT < 533) return 3;
  if (meanRT < 600) return 2;
  return 1;
}

function getSafetyVerdict(score: number): { label: string; color: string; bg: string } {
  if (score >= 7) return { label: 'SAFE TO DRIVE', color: '#fff', bg: '#16a34a' };
  if (score >= 5) return { label: 'USE CAUTION', color: '#000', bg: '#facc15' };
  return { label: 'DO NOT DRIVE', color: '#fff', bg: '#dc2626' };
}

export default function PVTTestScreen() {
  const router = useRouter();
  const { engine, showStimulus, remainingSeconds, startTest, handleTap, resetTest } = usePVTTest(60);
  const { addPVTResult, pvtResults } = useDataStore();

  const onTap = () => {
    handleTap();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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

  const shareResults = async () => {
    const score = getAlertnessScore(engine.meanRT);
    const verdict = getSafetyVerdict(score);
    const message =
      `VigilanceIQ Reaction Test Results\n` +
      `Alertness Score: ${score}/10\n` +
      `Status: ${verdict.label}\n` +
      `Avg Reaction Time: ${Math.round(engine.meanRT)} ms\n` +
      `Lapses (>500ms): ${engine.lapseCount}\n` +
      `Fastest: ${Math.round(engine.fastestRT)} ms`;
    await Share.share({ message });
  };

  // Pre-test instruction screen
  if (!engine.isActive && !engine.isComplete) {
    return (
      <ScrollView contentContainerStyle={styles.instructionContainer}>
        <Text style={styles.instructionHeader}>Reaction Time Test</Text>
        <Text style={styles.instructionSub}>60 seconds · Driver Safety Check</Text>

        <View style={styles.stepsBox}>
          <View style={styles.step}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
            <Text style={styles.stepText}>Watch the dark screen for a{' '}
              <Text style={styles.redWord}>red circle</Text>
            </Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
            <Text style={styles.stepText}>Tap the screen the instant it appears</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
            <Text style={styles.stepText}>Stay focused — it appears at random intervals</Text>
          </View>
        </View>

        <View style={styles.whyBox}>
          <Text style={styles.whyTitle}>Why it matters</Text>
          <Text style={styles.whyText}>
            Slow reaction time is an early warning sign of fatigue. A 60-second test can catch impairment
            before it becomes a safety risk on the road.
          </Text>
        </View>

        <Pressable style={styles.startButton} onPress={startTest}>
          <Text style={styles.startButtonText}>Start Test</Text>
        </Pressable>
        <Pressable style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // Results screen
  if (engine.isComplete) {
    const score = getAlertnessScore(engine.meanRT);
    const verdict = getSafetyVerdict(score);
    const color = PERFORMANCE_COLORS[engine.performanceLevel];
    const label = PERFORMANCE_LABELS[engine.performanceLevel];

    // Find baseline: average mean RT of the oldest 3 tests marked isBaseline, or the oldest non-current tests
    const baselineResults = pvtResults.filter((r) => r.isBaseline);
    let baselineRT: number | null = null;
    if (baselineResults.length >= 1) {
      baselineRT = baselineResults.reduce((sum, r) => {
        const mean = r.reactionTimes.reduce((a, b) => a + b, 0) / r.reactionTimes.length;
        return sum + mean;
      }, 0) / baselineResults.length;
    } else if (pvtResults.length >= 2) {
      // Use last 3 saved results as informal baseline
      const recent = pvtResults.slice(0, Math.min(3, pvtResults.length));
      baselineRT = recent.reduce((sum, r) => {
        const mean = r.reactionTimes.reduce((a, b) => a + b, 0) / r.reactionTimes.length;
        return sum + mean;
      }, 0) / recent.length;
    }

    const baselineDiff =
      baselineRT !== null
        ? Math.round(((engine.meanRT - baselineRT) / baselineRT) * 100)
        : null;

    return (
      <ScrollView contentContainerStyle={styles.resultsContainer}>
        <Text style={styles.resultsHeader}>Test Complete</Text>

        {/* Safety verdict badge */}
        <View style={[styles.verdictBadge, { backgroundColor: verdict.bg }]}>
          <Text style={[styles.verdictText, { color: verdict.color }]}>{verdict.label}</Text>
        </View>

        {/* Alertness score */}
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Alertness Score</Text>
          <Text style={[styles.scoreValue, { color }]}>{score}<Text style={styles.scoreMax}>/10</Text></Text>
        </View>
        <Text style={[styles.performanceLabel, { color }]}>{label}</Text>

        {/* Avg RT — the headline metric */}
        <Text style={[styles.bigRT, { color }]}>{Math.round(engine.meanRT)} ms</Text>
        <Text style={styles.bigRTLabel}>average reaction time</Text>

        {/* Baseline comparison */}
        {baselineDiff !== null && (
          <View style={[styles.baselineRow, { borderColor: baselineDiff > 0 ? '#f97316' : '#22c55e' }]}>
            <Text style={styles.baselineText}>
              {baselineDiff > 0
                ? `${baselineDiff}% slower than your baseline`
                : `${Math.abs(baselineDiff)}% faster than your baseline`}
            </Text>
          </View>
        )}

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{engine.lapseCount}</Text>
            <Text style={styles.statName}>Lapses{'\n'}({'>'}500ms)</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{Math.round(engine.fastestRT)}</Text>
            <Text style={styles.statName}>Fastest{'\n'}(ms)</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{engine.reactionTimes.length}</Text>
            <Text style={styles.statName}>Total{'\n'}Trials</Text>
          </View>
        </View>

        {/* Actions */}
        <Pressable style={styles.saveButton} onPress={saveAndExit}>
          <Text style={styles.saveButtonText}>Save & Exit</Text>
        </Pressable>
        <Pressable style={styles.shareButton} onPress={shareResults}>
          <Text style={styles.shareButtonText}>Share Results</Text>
        </Pressable>
        <Pressable style={styles.retakeButton} onPress={resetTest}>
          <Text style={styles.retakeText}>Retake Test</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // Active test — full-screen tap area
  return (
    <Pressable style={styles.fullScreen} onPress={onTap}>
      <Text style={styles.timerText}>{remainingSeconds}s</Text>
      {showStimulus ? (
        <View style={styles.stimulusCircle} />
      ) : (
        <View style={styles.waitCircle} />
      )}
      {engine.reactionTimes.length > 0 && !showStimulus && (
        <Text style={styles.lastRT}>
          {Math.round(engine.reactionTimes[engine.reactionTimes.length - 1])} ms
        </Text>
      )}
      {engine.comboLabel !== '' && (
        <Text style={styles.combo}>{engine.comboLabel}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Instruction screen
  instructionContainer: {
    flexGrow: 1,
    backgroundColor: '#0a0a0a',
    padding: 28,
    paddingTop: 60,
    paddingBottom: 48,
    alignItems: 'center',
  },
  instructionHeader: { color: '#fff', fontSize: 32, fontWeight: '800', textAlign: 'center' },
  instructionSub: { color: '#6b7280', fontSize: 16, marginTop: 6, marginBottom: 36, textAlign: 'center' },
  stepsBox: { width: '100%', marginBottom: 28 },
  step: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, gap: 16 },
  stepNum: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1e3a5f', justifyContent: 'center', alignItems: 'center', marginTop: 2,
  },
  stepNumText: { color: '#60a5fa', fontSize: 16, fontWeight: '700' },
  stepText: { color: '#d1d5db', fontSize: 20, flex: 1, lineHeight: 28 },
  redWord: { color: '#ef4444', fontWeight: '700' },
  whyBox: {
    width: '100%', backgroundColor: '#1c1c1e', borderRadius: 14,
    padding: 20, marginBottom: 36, borderLeftWidth: 4, borderLeftColor: '#f97316',
  },
  whyTitle: { color: '#fb923c', fontSize: 14, fontWeight: '700', marginBottom: 6, letterSpacing: 0.5 },
  whyText: { color: '#9ca3af', fontSize: 16, lineHeight: 24 },
  startButton: {
    width: '100%', backgroundColor: '#dc2626', borderRadius: 16,
    paddingVertical: 20, alignItems: 'center', marginBottom: 14,
  },
  startButtonText: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: 0.5 },
  cancelButton: { paddingVertical: 8 },
  cancelText: { color: '#6b7280', fontSize: 16 },

  // Active test
  fullScreen: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000',
  },
  timerText: { color: '#374151', fontSize: 22, position: 'absolute', top: 60, fontWeight: '600' },
  stimulusCircle: {
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444', shadowOpacity: 0.6, shadowRadius: 30, shadowOffset: { width: 0, height: 0 },
  },
  waitCircle: {
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: '#1a1a1a',
    borderWidth: 3, borderColor: '#2a2a2a',
  },
  lastRT: { color: '#4b5563', fontSize: 20, position: 'absolute', bottom: 90 },
  combo: { color: '#facc15', fontSize: 26, fontWeight: '700', position: 'absolute', bottom: 130 },

  // Results screen
  resultsContainer: {
    flexGrow: 1, backgroundColor: '#0a0a0a',
    padding: 28, paddingTop: 60, paddingBottom: 48, alignItems: 'center',
  },
  resultsHeader: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 20 },
  verdictBadge: {
    paddingHorizontal: 28, paddingVertical: 12, borderRadius: 50, marginBottom: 28,
  },
  verdictText: { fontSize: 18, fontWeight: '800', letterSpacing: 1.2 },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 12, marginBottom: 4 },
  scoreLabel: { color: '#9ca3af', fontSize: 16 },
  scoreValue: { fontSize: 48, fontWeight: '800' },
  scoreMax: { fontSize: 20, fontWeight: '400', color: '#6b7280' },
  performanceLabel: { fontSize: 16, marginBottom: 20 },
  bigRT: { fontSize: 72, fontWeight: '800', lineHeight: 80 },
  bigRTLabel: { color: '#6b7280', fontSize: 14, marginBottom: 20, letterSpacing: 0.5 },
  baselineRow: {
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 24,
  },
  baselineText: { color: '#d1d5db', fontSize: 15, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 32, width: '100%' },
  statBox: {
    flex: 1, backgroundColor: '#1c1c1e', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
  },
  statValue: { color: '#fff', fontSize: 26, fontWeight: '700' },
  statName: { color: '#6b7280', fontSize: 12, textAlign: 'center', marginTop: 4, lineHeight: 17 },
  saveButton: {
    width: '100%', backgroundColor: '#2563eb', borderRadius: 16,
    paddingVertical: 18, alignItems: 'center', marginBottom: 12,
  },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  shareButton: {
    width: '100%', backgroundColor: '#1c1c1e', borderRadius: 16,
    paddingVertical: 18, alignItems: 'center', marginBottom: 12,
    borderWidth: 1, borderColor: '#374151',
  },
  shareButtonText: { color: '#d1d5db', fontSize: 18, fontWeight: '600' },
  retakeButton: { paddingVertical: 10 },
  retakeText: { color: '#6b7280', fontSize: 16 },
});
