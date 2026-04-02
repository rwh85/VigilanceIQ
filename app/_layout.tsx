import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useAppStore } from '../src/stores/app-store';
import { useDataStore } from '../src/stores/data-store';
import { initDatabase } from '../src/services/database';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [ready, setReady] = useState(false);
  const loadPersistedState = useAppStore((s) => s.loadPersistedState);
  const loadAllData = useDataStore((s) => s.loadAllData);

  useEffect(() => {
    async function init() {
      await initDatabase();
      await loadPersistedState();
      await loadAllData();
      setReady(true);
    }
    init();
  }, []);

  if (!ready) return null;

  return (
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
    </Stack>
  );
}
