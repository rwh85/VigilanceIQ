import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
        },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="pvt-test" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="pvt-history" />
      <Stack.Screen name="caffeine-optimizer" />
      <Stack.Screen name="caffeine-presets" />
      <Stack.Screen name="add-sleep" options={{ presentation: 'modal' }} />
      <Stack.Screen name="achievements" />
    </Stack>
  );
}
