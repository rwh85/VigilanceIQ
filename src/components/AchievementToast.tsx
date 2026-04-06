import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut, BounceIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Achievement } from '../models/types';
import { spacing, radius } from '../theme';

const CATEGORY_COLORS: Record<string, string> = {
  consistency: '#3b82f6',
  speed: '#f97316',
  focus: '#22c55e',
  milestone: '#a855f7',
};

interface AchievementToastProps {
  achievement: Achievement;
  onDismiss: () => void;
}

export function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  const color = CATEGORY_COLORS[achievement.category] ?? '#a855f7';

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.overlay}>
      <Animated.View entering={BounceIn} style={styles.card}>
        <Ionicons name={achievement.iconName as any} size={50} color={color} />
        <Text style={styles.unlocked}>Achievement Unlocked!</Text>
        <Text style={styles.title}>{achievement.title}</Text>
        <Text style={styles.description}>{achievement.description}</Text>
        <Pressable onPress={onDismiss} style={[styles.button, { backgroundColor: color }]}>
          <Text style={styles.buttonText}>Awesome!</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    width: 280,
  },
  unlocked: { fontSize: 12, color: '#6b7280', textTransform: 'uppercase', marginTop: spacing.md },
  title: { fontSize: 22, fontWeight: '700', marginTop: spacing.xs },
  description: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: spacing.xs },
  button: { borderRadius: 10, paddingVertical: 12, paddingHorizontal: 32, marginTop: spacing.lg },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
