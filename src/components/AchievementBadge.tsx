import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Achievement } from '../models/types';
import { useThemeColors, spacing } from '../theme';

const CATEGORY_COLORS: Record<string, string> = {
  consistency: '#3b82f6',
  speed: '#f97316',
  focus: '#22c55e',
  milestone: '#a855f7',
};

interface AchievementBadgeProps {
  achievement: Achievement;
  isUnlocked: boolean;
}

export function AchievementBadge({ achievement, isUnlocked }: AchievementBadgeProps) {
  const theme = useThemeColors();
  const color = CATEGORY_COLORS[achievement.category] ?? theme.textSecondary;

  return (
    <View style={styles.container}>
      <View style={[styles.circle, { backgroundColor: isUnlocked ? color + '33' : theme.surface }]}>
        <Ionicons
          name={achievement.iconName as any}
          size={28}
          color={isUnlocked ? color : theme.textSecondary}
        />
      </View>
      <Text style={[styles.title, { color: isUnlocked ? theme.text : theme.textSecondary }]}>
        {achievement.title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: 80 },
  circle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 11, fontWeight: '600', textAlign: 'center', marginTop: spacing.xs },
});
