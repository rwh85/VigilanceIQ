import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-gifted-charts';
import { useAlertnessStore } from '../src/stores/alertness-store';
import { useDataStore } from '../src/stores/data-store';
import { getPerformanceLevel, PERFORMANCE_COLORS, PERFORMANCE_LABELS } from '../src/models/types';
import {
  computeNapRecommendation,
  computeAfterNapPrediction,
} from '../src/services/nap-recommendation';
import {
  scheduleNapWakeNotification,
  cancelNapWakeNotification,
} from '../src/services/notification-service';
import { useThemeColors, spacing, radius } from '../src/theme';
import { Constants } from '../src/models/constants';

function formatTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m} ${ampm}`;
}

function formatHour(h: number): string {
  const hour = Math.floor(h) % 24;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const display = hour % 12 || 12;
  return `${display}${ampm}`;
}

function formatCountdown(secondsLeft: number): string {
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function NapAdvisorScreen() {
  const theme = useThemeColors();
  const router = useRouter();

  const { currentImpairment, hoursAwake, prediction } = useAlertnessStore();
  const { caffeineIntakes, userParameters } = useDataStore();

  const now = new Date();
  const startHourOfDay = now.getHours() + now.getMinutes() / 60;

  const recommendation =
    prediction != null
      ? computeNapRecommendation(
          currentImpairment,
          hoursAwake,
          startHourOfDay,
          prediction,
        )
      : null;

  const afterNapPrediction =
    recommendation != null
      ? computeAfterNapPrediction(
          userParameters,
          caffeineIntakes,
          recommendation.napOffsetHours,
          recommendation.napDurationMinutes,
          12,
          startHourOfDay,
        )
      : null;

  // Nap timer state
  const [timerActive, setTimerActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleSetNapTimer = async () => {
    if (!recommendation) return;
    const durationSeconds = recommendation.napDurationMinutes * 60;
    const id = await scheduleNapWakeNotification(recommendation.napDurationMinutes);
    setNotificationId(id);
    setSecondsLeft(durationSeconds);
    setTimerActive(true);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCancelTimer = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (notificationId) await cancelNapWakeNotification(notificationId);
    setTimerActive(false);
    setSecondsLeft(0);
    setNotificationId(null);
  };

  const level = getPerformanceLevel(currentImpairment);
  const alertnessColor = PERFORMANCE_COLORS[level];
  const chartWidth = Dimensions.get('window').width - spacing.md * 2 - spacing.lg * 2;

  // Build chart data: before-nap (blue) vs after-nap (green), next 12 hours
  const beforeData =
    prediction?.times.map((t, i) => ({
      value: prediction.impairments[i],
      label: i % 4 === 0 ? formatHour((startHourOfDay + t) % 24) : '',
    })) ?? [];

  const afterData =
    afterNapPrediction?.times.map((t, i) => ({
      value: afterNapPrediction.impairments[i],
    })) ?? [];

  // Slice to 12h forecast
  const maxSteps = Math.ceil(12 / 0.5) + 1;
  const beforeSliced = beforeData.slice(0, maxSteps);
  const afterSliced = afterData.slice(0, maxSteps);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Nap Advisor</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Current Alertness Card */}
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Current Alertness</Text>
        <Text style={[styles.impairmentValue, { color: alertnessColor }]}>
          {Math.round(currentImpairment)} ms
        </Text>
        <Text style={[styles.levelLabel, { color: alertnessColor }]}>
          {PERFORMANCE_LABELS[level]}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Hours Awake</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{hoursAwake.toFixed(1)}h</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Status</Text>
            <Text style={[styles.statValue, { color: alertnessColor }]}>{PERFORMANCE_LABELS[level]}</Text>
          </View>
        </View>
      </View>

      {/* Recommendation Card */}
      {recommendation && (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.recHeader}>
            <Ionicons name="moon" size={20} color="#818cf8" />
            <Text style={[styles.cardLabel, { color: theme.textSecondary, marginLeft: spacing.xs }]}>
              Recommended Nap
            </Text>
          </View>

          <Text style={[styles.recWindow, { color: theme.text }]}>
            {recommendation.napNow
              ? `Best nap: Now until ${formatTime(recommendation.bestNapEndTime)}`
              : `Best nap: ${formatTime(recommendation.bestNapStartTime)} – ${formatTime(recommendation.bestNapEndTime)}`}
          </Text>

          <View style={[styles.durationBadge, { backgroundColor: '#818cf820' }]}>
            <Text style={[styles.durationText, { color: '#818cf8' }]}>
              {recommendation.napDurationMinutes}-minute{' '}
              {recommendation.napDurationMinutes <= 20 ? 'power nap' : 'sleep cycle'}
            </Text>
          </View>

          <Text style={[styles.explanation, { color: theme.textSecondary }]}>
            {recommendation.explanation}
          </Text>
        </View>
      )}

      {/* Chart: Before vs After */}
      {beforeSliced.length > 0 && afterSliced.length > 0 && (
        <View
          style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>
            Alertness Forecast: Before vs. After Nap
          </Text>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>Without nap</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>After nap</Text>
            </View>
          </View>

          <LineChart
            data={beforeSliced}
            data2={afterSliced}
            width={chartWidth}
            height={180}
            color="#3b82f6"
            color2="#22c55e"
            thickness={2}
            thickness2={2}
            hideDataPoints
            hideDataPoints2
            yAxisTextStyle={{ color: theme.textSecondary, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: theme.textSecondary, fontSize: 9 }}
            yAxisOffset={300}
            noOfSections={4}
            rulesColor={theme.border}
            backgroundColor={theme.surface}
            curved
            referenceLine1Position={Constants.AlertnessThresholds.fair}
            referenceLine1Config={{ color: '#eab308', dashWidth: 6, dashGap: 4 }}
            referenceLine2Position={Constants.AlertnessThresholds.poor}
            referenceLine2Config={{ color: '#ef4444', dashWidth: 6, dashGap: 4 }}
          />
        </View>
      )}

      {/* Nap Timer */}
      {recommendation && (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {timerActive ? (
            <>
              <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Nap Timer</Text>
              <Text style={[styles.countdown, { color: theme.text }]}>
                {formatCountdown(secondsLeft)}
              </Text>
              <Text style={[styles.countdownSub, { color: theme.textSecondary }]}>
                Wake-up notification scheduled
              </Text>
              <Pressable
                style={[styles.cancelBtn, { borderColor: theme.border }]}
                onPress={handleCancelTimer}
              >
                <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>
                  Cancel Timer
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable style={styles.napTimerBtn} onPress={handleSetNapTimer}>
                <Ionicons name="alarm-outline" size={20} color="#fff" style={{ marginRight: spacing.xs }} />
                <Text style={styles.napTimerBtnText}>
                  Set {recommendation.napDurationMinutes}-Minute Nap Timer
                </Text>
              </Pressable>
              <Text style={[styles.timerNote, { color: theme.textSecondary }]}>
                A notification will wake you when your nap is complete.
              </Text>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: spacing.xl },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backBtn: { width: 32, alignItems: 'flex-start' },
  headerTitle: { fontSize: 18, fontWeight: '700' },

  card: {
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  cardLabel: { fontSize: 13, fontWeight: '600', marginBottom: spacing.xs },

  impairmentValue: { fontSize: 48, fontWeight: '700' },
  levelLabel: { fontSize: 15, marginBottom: spacing.sm },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.xs },
  stat: { alignItems: 'center' },
  statLabel: { fontSize: 12 },
  statValue: { fontSize: 16, fontWeight: '600' },

  recHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  recWindow: { fontSize: 17, fontWeight: '700', marginBottom: spacing.sm },
  durationBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginBottom: spacing.sm,
  },
  durationText: { fontSize: 13, fontWeight: '600' },
  explanation: { fontSize: 14, lineHeight: 20 },

  legend: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12 },

  countdown: { fontSize: 56, fontWeight: '700', textAlign: 'center', marginVertical: spacing.sm },
  countdownSub: { fontSize: 13, textAlign: 'center', marginBottom: spacing.md },
  cancelBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 14, fontWeight: '600' },

  napTimerBtn: {
    flexDirection: 'row',
    backgroundColor: '#818cf8',
    borderRadius: radius.md,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  napTimerBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  timerNote: { fontSize: 12, textAlign: 'center', marginTop: spacing.sm },
});
