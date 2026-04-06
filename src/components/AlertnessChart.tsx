import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { AlertnessPrediction } from '../models/types';
import { Constants } from '../models/constants';
import { useThemeColors, spacing, radius, alertnessColors, typography } from '../theme';

interface AlertnessChartProps {
  prediction: AlertnessPrediction;
  startHourOfDay: number;
}

export function AlertnessChart({ prediction, startHourOfDay }: AlertnessChartProps) {
  const theme = useThemeColors();
  const width = Dimensions.get('window').width - spacing.lg * 2;

  const data = prediction.times.map((t, i) => ({
    value: prediction.impairments[i],
    label: i % 4 === 0 ? formatHour((startHourOfDay + t) % 24) : '',
  }));

  const chartFill = theme.caffeineAccent + '33'; // 20% opacity

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.text }]}>Alertness Forecast</Text>
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
});
