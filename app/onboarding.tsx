import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../src/stores/app-store';
import { requestNotificationPermissions, schedulePVTReminders } from '../src/services/notification-service';
import { spacing } from '../src/theme';

type Step = 'welcome' | 'health' | 'notifications' | 'baseline';

export default function OnboardingScreen() {
  const router = useRouter();
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);
  const [step, setStep] = useState<Step>('welcome');

  const finish = () => {
    setOnboardingComplete();
    router.replace('/(tabs)');
  };

  if (step === 'welcome') {
    return (
      <OnboardingPage
        icon="pulse"
        title="Welcome to VigilanceIQ"
        body="Predict your alertness, optimize caffeine intake, and track your cognitive performance."
        buttonText="Get Started"
        onPress={() => setStep('health')}
      />
    );
  }

  if (step === 'health') {
    return (
      <OnboardingPage
        icon="heart-circle-outline"
        title="Sleep Data"
        body="VigilanceIQ can read your sleep data to make accurate alertness predictions. On iOS this uses HealthKit, on Android it uses Health Connect."
        buttonText="Grant Access"
        onPress={async () => {
          setStep('notifications');
        }}
        secondaryText="Skip"
        onSecondary={() => setStep('notifications')}
      />
    );
  }

  if (step === 'notifications') {
    return (
      <OnboardingPage
        icon="notifications-outline"
        title="Notifications"
        body="Get reminders for PVT tests 3x daily and alerts when your alertness drops too low."
        buttonText="Enable Notifications"
        onPress={async () => {
          const granted = await requestNotificationPermissions();
          if (granted) await schedulePVTReminders();
          setStep('baseline');
        }}
        secondaryText="Skip"
        onSecondary={() => setStep('baseline')}
      />
    );
  }

  return (
    <OnboardingPage
      icon="speedometer-outline"
      title="Establish Your Baseline"
      body="Complete 3 PVT tests when well-rested to calibrate the model to your personal reaction time. You can do this from the PVT tab."
      buttonText="Start Using VigilanceIQ"
      onPress={finish}
    />
  );
}

function OnboardingPage({
  icon, title, body, buttonText, onPress, secondaryText, onSecondary,
}: {
  icon: string; title: string; body: string; buttonText: string; onPress: () => void;
  secondaryText?: string; onSecondary?: () => void;
}) {
  return (
    <View style={styles.page}>
      <Ionicons name={icon as any} size={80} color="#3b82f6" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      <Pressable style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </Pressable>
      {secondaryText && onSecondary && (
        <Pressable style={styles.secondary} onPress={onSecondary}>
          <Text style={styles.secondaryText}>{secondaryText}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', padding: 32 },
  title: { color: '#fff', fontSize: 28, fontWeight: '700', marginTop: 24, marginBottom: 8 },
  body: { color: '#9ca3af', fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 32, paddingHorizontal: 16 },
  button: { backgroundColor: '#2563eb', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 48 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  secondary: { marginTop: 16 },
  secondaryText: { color: '#6b7280', fontSize: 16 },
});
