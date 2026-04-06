import { View, Text, StyleSheet, Dimensions, Animated, Pressable } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { LineChart } from 'react-native-gifted-charts';
import {
  AlertnessPrediction,
  reactionTimeToAlertness,
  getPerformanceLevel,
  PERFORMANCE_LABELS,
} from '../models/types';
import { Constants } from '../models/constants';
import { useThemeColors, spacing, radius, alertnessColors, typography } from '../theme';
import { useAppStore } from '../stores/app-store';

type ForecastView = 12 | 24 | 48;
const FORECAST_OPTIONS: ForecastView[] = [12, 24, 48];

function toForecastView(hours: number): ForecastView {
  if (hours <= 12) return 12;
  if (hours <= 24) return 24;
  return 48;
}

interface AlertnessChartProps {
  prediction: AlertnessPrediction;
  startHourOfDay: number;
}

interface ChartSummary {
  currentScore: string;
  currentLevel: string;
  worstScore: string;
  worstTime: string;
  caffeineWindowText: string;
}

function buildChartSummary(
  prediction: AlertnessPrediction,
  startHourOfDay: number,
): ChartSummary {
  const { times, impairments } = prediction;

  const currentImpairment = impairments[0] ?? Constants.AlertnessThresholds.good;
  const currentScore = reactionTimeToAlertness(currentImpairment);
  const currentLevel = PERFORMANCE_LABELS[getPerformanceLevel(currentImpairment)];

  // Find lowest alertness in next 6h (highest impairment = lowest alertness)
  let worstImpairment = currentImpairment;
  let worstTimeOffset = 0;
  for (let i = 0; i < times.length; i++) {
    if (times[i] > 6) break;
    if (impairments[i] > worstImpairment) {
      worstImpairment = impairments[i];
      worstTimeOffset = times[i];
    }
  }
  const worstScore = reactionTimeToAlertness(worstImpairment);
  const worstClockHour = (startHourOfDay + worstTimeOffset) % 24;

  // Recommended caffeine window: first crossing above "fair" impairment threshold in next 6h
  let caffeineWindowText = 'No caffeine needed in next 6 hours';
  for (let i = 1; i < times.length; i++) {
    if (times[i] > 6) break;
    if (
      impairments[i] >= Constants.AlertnessThresholds.fair &&
      impairments[i - 1] < Constants.AlertnessThresholds.fair
    ) {
      const clockHour = (startHourOfDay + times[i]) % 24;
      caffeineWindowText = `Consider caffeine around ${formatHour(clockHour)}`;
      break;
    }
  }

  return {
    currentScore: currentScore.toFixed(1),
    currentLevel,
    worstScore: worstScore.toFixed(1),
    worstTime: formatHour(worstClockHour),
    caffeineWindowText,
  };
}

export function AlertnessChart({ prediction, startHourOfDay }: AlertnessChartProps) {
  const theme = useThemeColors();
  const width = Dimensions.get('window').width - spacing.lg * 2;
  const forecastDurationHours = useAppStore((s) => s.forecastDurationHours);
  const setForecastDuration = useAppStore((s) => s.setForecastDuration);
  const [viewHours, setViewHours] = useState<ForecastView>(() => toForecastView(forecastDurationHours));

  useEffect(() => {
    if (viewHours !== forecastDurationHours) {
      setForecastDuration(viewHours);
    }
  }, [viewHours, forecastDurationHours, setForecastDuration]);

  const summary = buildChartSummary(prediction, startHourOfDay);

  // 48h view uses 12h x-axis stride (every 24 points at 0.5h step); others use 2h stride (every 4 points)
  const labelStride = viewHours === 48 ? 24 : 4;
  const data = prediction.times.map((t, i) => ({
    value: prediction.impairments[i],
    label: i % labelStride === 0 ? formatHour((startHourOfDay + t) % 24) : '',
  }));

  const chartFill = theme.caffeineAccent + '33'; // 20% opacity

  const chartA11yLabel =
    `Alertness Forecast chart, ${viewHours}-hour view. ` +
    `Current score: ${summary.currentScore} out of 10, ${summary.currentLevel}. ` +
    `Lowest point in next 6 hours: ${summary.worstScore} out of 10 at ${summary.worstTime}. ` +
    `${summary.caffeineWindowText}.`;

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.text }]}>Alertness Forecast</Text>

      {/* Forecast duration picker */}
      <View style={styles.pickerRow} accessibilityRole="radiogroup" accessibilityLabel="Forecast duration">
        {FORECAST_OPTIONS.map((opt) => {
          const selected = viewHours === opt;
          return (
            <Pressable
              key={opt}
              style={[
                styles.pickerBtn,
                { borderColor: theme.border },
                selected && { backgroundColor: theme.caffeineAccent, borderColor: theme.caffeineAccent },
              ]}
              onPress={() => setViewHours(opt)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`${opt}-hour forecast`}
            >
              <Text style={[styles.pickerBtnText, { color: selected ? '#fff' : theme.textSecondary }]}>
                {opt}h
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Chart wrapped as a single accessibility element so VoiceOver reads the label */}
      <View
        accessible={true}
        accessibilityRole="image"
        accessibilityLabel={chartA11yLabel}
      >
        <LineChart
          data={data}
          width={width - spacing.xxl * 2}
          height={200}
          color={theme.caffeineAccent}
          thickness={2}
          hideDataPoints
          yAxisTextStyle={{ color: theme.textSecondary, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: theme.textSecondary, fontSize: 9 }}
          yAxisOffset={300}
          noOfSections={4}
          rulesColor={theme.border}
          backgroundColor={theme.surface}
          curved
          areaChart
          startFillColor={chartFill}
          endFillColor={theme.caffeineAccent + '03'}
          referenceLine1Position={Constants.AlertnessThresholds.fair}
          referenceLine1Config={{
            color: alertnessColors.fair,
            dashWidth: 6,
            dashGap: 4,
          }}
          referenceLine2Position={Constants.AlertnessThresholds.poor}
          referenceLine2Config={{
            color: alertnessColors.veryPoor,
            dashWidth: 6,
            dashGap: 4,
          }}
        />
      </View>

      {/* Chart Summary — visible to all users; each row is a single VoiceOver element */}
      <View style={[styles.summaryContainer, { borderTopColor: theme.border }]}>
        <Text style={[styles.summaryHeader, { color: theme.textSecondary }]}>
          Chart Summary
        </Text>
        <View
          style={styles.summaryRow}
          accessible={true}
          accessibilityLabel={`Current alertness: ${summary.currentScore} out of 10. ${summary.currentLevel}.`}
        >
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Now</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>
            {summary.currentScore}/10 · {summary.currentLevel}
          </Text>
        </View>
        <View
          style={styles.summaryRow}
          accessible={true}
          accessibilityLabel={`Lowest alertness in next 6 hours: ${summary.worstScore} out of 10, at ${summary.worstTime}.`}
        >
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
            Lowest (next 6h)
          </Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>
            {summary.worstScore}/10 at {summary.worstTime}
          </Text>
        </View>
        <View
          style={styles.summaryRow}
          accessible={true}
          accessibilityLabel={`Caffeine recommendation: ${summary.caffeineWindowText}.`}
        >
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Caffeine</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>
            {summary.caffeineWindowText}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function AlertnessChartSkeleton() {
  const theme = useThemeColors();
  const shimmer = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [shimmer]);

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Animated.View
        style={[styles.skeletonTitle, { backgroundColor: theme.border, opacity: shimmer }]}
      />
      <Animated.View
        style={[styles.skeletonChart, { backgroundColor: theme.border, opacity: shimmer }]}
      />
    </View>
  );
}

function formatHour(h: number): string {
  const hour = Math.floor(h) % 24;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const display = hour % 12 || 12;
  return `${display}${ampm}`;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },
  title: { ...typography.headingSmall, marginBottom: spacing.sm },
  pickerRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  pickerBtn: {
    flex: 1,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  pickerBtnText: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  skeletonTitle: {
    height: 20,
    width: 140,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  skeletonChart: {
    height: 200,
    borderRadius: radius.sm,
  },
  summaryContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
  },
  summaryHeader: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  summaryLabel: {
    ...typography.bodySmall,
  },
  summaryValue: {
    ...typography.bodySmall,
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'right',
  },
});
