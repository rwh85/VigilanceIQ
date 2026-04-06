import { useEffect, useRef, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useColorScheme, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAppStore } from '../src/stores/app-store';
import { useDataStore } from '../src/stores/data-store';
import { initDatabase } from '../src/services/database';
import healthService from '../src/services/health/health-service';
import {
  requestNotificationPermissions,
  setupNotificationCategories,
} from '../src/services/notification-service';
import { DrowsinessAlertBanner } from '../src/components/DrowsinessAlertBanner';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [ready, setReady] = useState(false);
  const loadPersistedState = useAppStore((s) => s.loadPersistedState);
  const loadAllData = useDataStore((s) => s.loadAllData);
  const router = useRouter();
  const responseListenerRef = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    async function init() {
      await initDatabase();
      await loadPersistedState();
      await loadAllData();
      await healthService.requestPermissions();
      await setupNotificationCategories();
      requestNotificationPermissions().catch(() => {});
      setReady(true);
    }
    init();
  }, []);

  const hasSeenOnboarding = useAppStore((s) => s.hasSeenOnboarding);

  useEffect(() => {
    if (!ready) return;
    if (!hasSeenOnboarding) {
      router.replace('/onboarding' as never);
    }
  }, [ready, hasSeenOnboarding]);

  useEffect(() => {
    responseListenerRef.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        if (response.actionIdentifier === 'take_nap_break') {
          router.push('/nap' as never);
        }
      },
    );
    return () => {
      responseListenerRef.current?.remove();
    };
  }, [router]);

  if (!ready) return null;

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="pvt-test" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
        <Stack.Screen name="pvt-history" />
        <Stack.Screen name="caffeine-optimizer" />
        <Stack.Screen name="caffeine-presets" />
        <Stack.Screen name="add-sleep" options={{ presentation: 'modal' }} />
        <Stack.Screen name="achievements" />
        <Stack.Screen name="nap" />
      </Stack>
      <DrowsinessAlertBanner />
    </View>
  );
}
