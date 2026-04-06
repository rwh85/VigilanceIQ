import { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, TextInput, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../src/stores/app-store';
import { requestNotificationPermissions, schedulePVTReminders } from '../src/services/notification-service';
import healthService from '../src/services/health/health-service';

type Step = 'welcome' | 'how-it-works' | 'permissions' | 'profile' | 'ready';

const STEPS: Step[] = ['welcome', 'how-it-works', 'permissions', 'profile', 'ready'];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setOnboardingComplete, setDriverProfile, shiftStartHour: savedShift, dailyDrivingHours: savedHours, driverName: savedName } = useAppStore();
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState(savedName);
  const [shiftStartHour, setShiftStartHour] = useState(savedShift);
  const [dailyDrivingHours, setDailyDrivingHours] = useState(savedHours);

  const stepIndex = STEPS.indexOf(step);
  const progress = (stepIndex + 1) / STEPS.length;

  const next = (s: Step) => setStep(s);

  const finish = () => {
    setDriverProfile(name.trim(), shiftStartHour, dailyDrivingHours);
    setOnboardingComplete();
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ProgressBar progress={progress} />

      {step === 'welcome' && (
        <WelcomeStep onNext={() => next('how-it-works')} />
      )}
      {step === 'how-it-works' && (
        <HowItWorksStep onNext={() => next('permissions')} />
      )}
      {step === 'permissions' && (
        <PermissionsStep onNext={() => next('profile')} />
      )}
      {step === 'profile' && (
        <ProfileStep
          name={name}
          shiftStartHour={shiftStartHour}
          dailyDrivingHours={dailyDrivingHours}
          onChangeName={setName}
          onChangeShift={setShiftStartHour}
          onChangeDriving={setDailyDrivingHours}
          onNext={() => next('ready')}
        />
      )}
      {step === 'ready' && (
        <ReadyStep name={name.trim()} onFinish={finish} />
      )}
    </KeyboardAvoidingView>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
    </View>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <View style={styles.page}>
      <Ionicons name="shield-checkmark" size={88} color="#2563eb" />
      <Text style={styles.title}>Stay Alert, Stay Safe on the Road</Text>
      <Text style={styles.body}>
        VigilanceIQ helps you track your fatigue during shifts so you can drive safely and get home to your family.
      </Text>
      <Pressable style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>
    </View>
  );
}

function HowItWorksStep({ onNext }: { onNext: () => void }) {
  const steps = [
    { icon: 'moon', label: 'Log your sleep', desc: 'Tell us when you rested before your shift' },
    { icon: 'timer', label: 'Take a quick reaction test', desc: '30 seconds, 3× a day — tracks your alertness' },
    { icon: 'notifications', label: 'Get alerts before it matters', desc: "We warn you before you're too tired to notice" },
  ];
  return (
    <View style={styles.page}>
      <Text style={styles.title}>How It Works</Text>
      <View style={styles.stepList}>
        {steps.map((s, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepIconWrap}>
              <Ionicons name={s.icon as any} size={28} color="#2563eb" />
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepLabel}>{s.label}</Text>
              <Text style={styles.stepDesc}>{s.desc}</Text>
            </View>
          </View>
        ))}
      </View>
      <Pressable style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>Next</Text>
      </Pressable>
    </View>
  );
}

function PermissionsStep({ onNext }: { onNext: () => void }) {
  const handleGrant = async () => {
    await healthService.requestPermissions();
    const granted = await requestNotificationPermissions();
    if (granted) await schedulePVTReminders();
    onNext();
  };

  return (
    <View style={styles.page}>
      <Ionicons name="lock-open-outline" size={88} color="#2563eb" />
      <Text style={styles.title}>Two Quick Permissions</Text>
      <View style={styles.permList}>
        <PermRow
          icon="heart-circle-outline"
          title="Sleep & Health Data"
          desc="Reads your sleep logs to estimate how rested you are before your shift"
        />
        <PermRow
          icon="notifications-outline"
          title="Notifications"
          desc="Sends reminders for reaction tests and alerts if your alertness drops low"
        />
      </View>
      <Pressable style={styles.button} onPress={handleGrant}>
        <Text style={styles.buttonText}>Allow Access</Text>
      </Pressable>
      <Pressable style={styles.secondary} onPress={onNext}>
        <Text style={styles.secondaryText}>Skip for now</Text>
      </Pressable>
    </View>
  );
}

function PermRow({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <View style={styles.permRow}>
      <Ionicons name={icon as any} size={28} color="#60a5fa" style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.permTitle}>{title}</Text>
        <Text style={styles.permDesc}>{desc}</Text>
      </View>
    </View>
  );
}

function ProfileStep({
  name, shiftStartHour, dailyDrivingHours,
  onChangeName, onChangeShift, onChangeDriving, onNext,
}: {
  name: string; shiftStartHour: number; dailyDrivingHours: number;
  onChangeName: (v: string) => void;
  onChangeShift: (v: number) => void;
  onChangeDriving: (v: number) => void;
  onNext: () => void;
}) {
  const formatHour = (h: number) => {
    const ampm = h < 12 ? 'AM' : 'PM';
    const display = h % 12 === 0 ? 12 : h % 12;
    return `${display}:00 ${ampm}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Your Driving Profile</Text>
      <Text style={styles.body}>We use this to build your personalized fatigue forecast.</Text>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Your first name</Text>
        <TextInput
          style={styles.textInput}
          value={name}
          onChangeText={onChangeName}
          placeholder="e.g. Mike"
          placeholderTextColor="#4b5563"
          returnKeyType="done"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Typical shift start</Text>
        <View style={styles.stepper}>
          <Pressable
            style={styles.stepBtn}
            onPress={() => onChangeShift(Math.max(0, shiftStartHour - 1))}
            hitSlop={8}
          >
            <Text style={styles.stepBtnText}>−</Text>
          </Pressable>
          <Text style={styles.stepValue}>{formatHour(shiftStartHour)}</Text>
          <Pressable
            style={styles.stepBtn}
            onPress={() => onChangeShift(Math.min(23, shiftStartHour + 1))}
            hitSlop={8}
          >
            <Text style={styles.stepBtnText}>+</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Typical driving hours per day</Text>
        <View style={styles.stepper}>
          <Pressable
            style={styles.stepBtn}
            onPress={() => onChangeDriving(Math.max(1, dailyDrivingHours - 1))}
            hitSlop={8}
          >
            <Text style={styles.stepBtnText}>−</Text>
          </Pressable>
          <Text style={styles.stepValue}>{dailyDrivingHours}h</Text>
          <Pressable
            style={styles.stepBtn}
            onPress={() => onChangeDriving(Math.min(14, dailyDrivingHours + 1))}
            hitSlop={8}
          >
            <Text style={styles.stepBtnText}>+</Text>
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </ScrollView>
  );
}

function ReadyStep({ name, onFinish }: { name: string; onFinish: () => void }) {
  const greeting = name ? `You're all set, ${name}!` : "You're all set!";
  return (
    <View style={styles.page}>
      <Ionicons name="checkmark-circle" size={88} color="#22c55e" />
      <Text style={styles.title}>{greeting}</Text>
      <Text style={styles.body}>
        Log your first sleep entry before your next shift and take a quick reaction test when you're rested. We'll do the rest.
      </Text>
      <Text style={styles.tagline}>Drive safe. Drive smart.</Text>
      <Pressable style={[styles.button, styles.buttonGreen]} onPress={onFinish}>
        <Text style={styles.buttonText}>Let's Start</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  progressTrack: { height: 3, backgroundColor: '#1f2937', marginTop: 52 },
  progressFill: { height: 3, backgroundColor: '#2563eb' },
  page: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 32, paddingVertical: 40,
  },
  title: {
    color: '#fff', fontSize: 28, fontWeight: '700', textAlign: 'center',
    marginTop: 28, marginBottom: 12, lineHeight: 36,
  },
  body: {
    color: '#9ca3af', fontSize: 18, textAlign: 'center', lineHeight: 28,
    marginBottom: 32, paddingHorizontal: 8,
  },
  tagline: {
    color: '#60a5fa', fontSize: 18, fontWeight: '600', marginBottom: 32,
  },
  button: {
    backgroundColor: '#2563eb', borderRadius: 14,
    paddingVertical: 18, paddingHorizontal: 52,
    alignSelf: 'stretch', alignItems: 'center',
  },
  buttonGreen: { backgroundColor: '#16a34a' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  secondary: { marginTop: 18 },
  secondaryText: { color: '#6b7280', fontSize: 17 },

  // How it works
  stepList: { width: '100%', marginBottom: 36, gap: 20 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  stepIconWrap: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: '#1e3a5f', justifyContent: 'center', alignItems: 'center',
  },
  stepText: { flex: 1, paddingTop: 4 },
  stepLabel: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 4 },
  stepDesc: { color: '#9ca3af', fontSize: 15, lineHeight: 22 },

  // Permissions
  permList: { width: '100%', marginBottom: 36, gap: 20 },
  permRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  permTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 4 },
  permDesc: { color: '#9ca3af', fontSize: 15, lineHeight: 22 },

  // Profile
  fieldGroup: { width: '100%', marginBottom: 28 },
  fieldLabel: { color: '#9ca3af', fontSize: 15, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  textInput: {
    backgroundColor: '#1c1c1e', borderRadius: 12, borderWidth: 1, borderColor: '#374151',
    color: '#fff', fontSize: 18, paddingHorizontal: 16, paddingVertical: 14,
  },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepBtn: {
    width: 44, height: 44, borderRadius: 10, borderWidth: 1.5, borderColor: '#2563eb',
    alignItems: 'center', justifyContent: 'center',
  },
  stepBtnText: { color: '#2563eb', fontSize: 22, lineHeight: 26, fontWeight: '500' },
  stepValue: { color: '#fff', fontSize: 18, fontWeight: '600', minWidth: 96 },
});
