import * as Notifications from 'expo-notifications';
import { Constants } from '../models/constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function schedulePVTReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const times = [
    { hour: 9, minute: 0 },
    { hour: 14, minute: 0 },
    { hour: 19, minute: 0 },
  ];
  for (const time of times) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'PVT Test Reminder',
        body: 'Time for your alertness check! Take a quick PVT test.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.hour,
        minute: time.minute,
      },
    });
  }
}

export async function scheduleCaffeineReminder(
  title: string,
  body: string,
  triggerDate: Date,
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
  });
  return id;
}

export async function sendLowAlertnessWarning(impairmentMs: number): Promise<void> {
  const severity = impairmentMs >= Constants.Monitoring.severeImpairmentThreshold ? 'severe' : 'moderate';
  await Notifications.scheduleNotificationAsync({
    content: {
      title: severity === 'severe' ? 'Alertness Warning' : 'Alertness Notice',
      body: severity === 'severe'
        ? 'Your alertness is severely impaired. Consider caffeine or a break.'
        : 'Your alertness is declining. A caffeinated beverage may help.',
      sound: true,
    },
    trigger: null,
  });
}

export async function sendPersonalizationComplete(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Personalization Complete!',
      body: 'Your alertness model is now fully calibrated to your unique physiology.',
      sound: true,
    },
    trigger: null,
  });
}

export async function setupNotificationCategories(): Promise<void> {
  await Notifications.setNotificationCategoryAsync('drowsiness_alert', [
    {
      identifier: 'dismiss',
      buttonTitle: 'Dismiss',
      options: { isDestructive: false, isAuthenticationRequired: false },
    },
    {
      identifier: 'take_nap_break',
      buttonTitle: 'Take Nap Break',
      options: { isDestructive: false, isAuthenticationRequired: false, opensAppToForeground: true },
    },
  ]);
}

export async function sendDrowsinessAlert(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Drowsiness Alert',
      body: 'Your alertness is low. Consider taking a break or a short nap.',
      sound: true,
      categoryIdentifier: 'drowsiness_alert',
    },
    trigger: null,
  });
}
