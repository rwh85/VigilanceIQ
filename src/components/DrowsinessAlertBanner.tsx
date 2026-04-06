import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAlertnessStore } from '../stores/alertness-store';
import { spacing, radius } from '../theme';

export function DrowsinessAlertBanner() {
  const alertActive = useAlertnessStore((s) => s.alertActive);
  const dismiss = useAlertnessStore((s) => s.dismissDrowsinessAlert);
  const router = useRouter();

  if (!alertActive) return null;

  const handleNapBreak = () => {
    dismiss();
    router.push('/nap' as never);
  };

  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <Text style={styles.title}>Drowsiness Alert</Text>
        <Text style={styles.body}>
          Your alertness is low. Consider taking a break or a short nap.
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={handleNapBreak} style={styles.napBtn}>
          <Text style={styles.napBtnText}>Take Nap Break</Text>
        </Pressable>
        <Pressable onPress={dismiss} style={styles.dismissBtn}>
          <Text style={styles.dismissBtnText}>Dismiss</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#dc2626',
    paddingTop: 52,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  content: {
    marginBottom: spacing.sm,
  },
  title: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  body: {
    color: '#fecaca',
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  napBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  napBtnText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  dismissBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#fecaca',
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  dismissBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
