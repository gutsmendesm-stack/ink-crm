import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  if (!Device.isDevice) {
    // Running on simulator - push notifications won't work but local ones will
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    token = tokenData.data;
  } catch (error) {
    // Token retrieval failed (common on simulators)
    console.log('Push token not available:', error);
  }

  return token;
}

export async function scheduleAppointmentReminder(
  appointmentId: string,
  title: string,
  clientName: string,
  date: Date,
  hoursBeforeDefault: number = 2
) {
  // Schedule reminder X hours before the appointment
  const reminderDate = new Date(date.getTime() - hoursBeforeDefault * 60 * 60 * 1000);

  // Don't schedule if it's in the past
  if (reminderDate <= new Date()) return null;

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: `🖊️ Lembrete: ${title}`,
      body: `Sessão com ${clientName} em ${hoursBeforeDefault}h`,
      data: { appointmentId },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
    },
  });

  return identifier;
}

export async function scheduleDepositReminder(
  appointmentId: string,
  clientName: string,
  depositAmount: number
) {
  // Schedule for 24 hours from now
  const reminderDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: '💰 Sinal pendente',
      body: `${clientName} ainda não pagou o sinal de R$ ${depositAmount.toFixed(2)}`,
      data: { appointmentId },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
    },
  });

  return identifier;
}

export async function cancelNotification(identifier: string) {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
