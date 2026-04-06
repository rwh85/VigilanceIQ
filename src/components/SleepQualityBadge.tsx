import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SleepQuality } from '../models/types';
import { alertnessColors, spacing, radius } from '../theme';

interface Props {
  quality: SleepQuality;
}

const QUALITY_LABELS: Record<SleepQuality, string> = {
  poor: 'Poor',
  fair: 'Fair',
  good: 'Good',
  excellent: 'Excellent',
};

export function SleepQualityBadge({ quality }: Props) {
  const color = alertnessColors[quality];
  return (
    <View
      style={[styles.badge, { backgroundColor: color + '33' }]}
      accessible
      accessibilityLabel={`Sleep quality: ${quality}`}
    >
      <Text style={[styles.label, { color }]}>{QUALITY_LABELS[quality]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 1,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
