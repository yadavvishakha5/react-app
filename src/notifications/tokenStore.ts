import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppNotification } from './types';

const FCM_TOKEN_KEY = '@fcm/device-token';
const NOTIFICATION_LOG_KEY = '@fcm/notification-log';
const MAX_LOG_ITEMS = 25;

export async function saveFcmToken(token: string): Promise<void> {
  await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
}

export async function getSavedFcmToken(): Promise<string | null> {
  return AsyncStorage.getItem(FCM_TOKEN_KEY);
}

export async function clearSavedFcmToken(): Promise<void> {
  await AsyncStorage.removeItem(FCM_TOKEN_KEY);
}

export async function appendNotificationLog(
  notification: AppNotification,
): Promise<AppNotification[]> {
  const existing = await getNotificationLog();
  const next = [
    notification,
    ...existing.filter(item => item.id !== notification.id),
  ].slice(0, MAX_LOG_ITEMS);
  await AsyncStorage.setItem(NOTIFICATION_LOG_KEY, JSON.stringify(next));
  return next;
}

export async function getNotificationLog(): Promise<AppNotification[]> {
  const raw = await AsyncStorage.getItem(NOTIFICATION_LOG_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as AppNotification[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
