import { Platform } from 'react-native';
import {
  getAPNSToken,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
  subscribeToTopic,
  unsubscribeFromTopic,
} from '@react-native-firebase/messaging';
import { APP_VERSION, DEFAULT_TOPIC, platformName } from '../config';
import {
  registerDeviceToken,
  unregisterDeviceToken,
} from '../api/deviceTokenApi';
import {
  isPermissionGranted,
  requestNotificationPermission,
} from './permission';
import { parseRemoteMessage } from './payload';
import { isTokenChanged, mapDeviceToken } from './tokenMapper';
import {
  appendNotificationLog,
  clearSavedFcmToken,
  getSavedFcmToken,
  saveFcmToken,
} from './tokenStore';
import type {
  AppNotification,
  DeviceTokenPayload,
  TokenRegistrationResult,
} from './types';

const messaging = getMessaging();

export async function ensureDeviceRegistration(): Promise<void> {
  if (Platform.OS !== 'ios') {
    return;
  }

  try {
    await registerDeviceForRemoteMessages(messaging);
  } catch (error) {
    // ARM64 Simulator times out by design; physical devices should succeed.
    console.warn('APNs registration skipped or timed out', error);
  }
}

export async function getCurrentFcmToken(): Promise<string | null> {
  await ensureDeviceRegistration();
  try {
    const token = await getToken(messaging);
    return token || null;
  } catch (error) {
    console.warn('Unable to read FCM token', error);
    return null;
  }
}

export async function getCurrentApnsToken(): Promise<string | null> {
  if (Platform.OS !== 'ios') {
    return null;
  }

  try {
    return (await getAPNSToken(messaging)) ?? null;
  } catch {
    return null;
  }
}

export async function buildDeviceTokenPayload(
  userId?: string,
): Promise<DeviceTokenPayload | null> {
  const fcmToken = await getCurrentFcmToken();
  if (!fcmToken) {
    return null;
  }

  return mapDeviceToken({
    fcmToken,
    apnsToken: await getCurrentApnsToken(),
    platform: platformName,
    appVersion: APP_VERSION,
    userId,
  });
}

export async function syncDeviceToken(
  userId?: string,
): Promise<TokenRegistrationResult & { token: string | null }> {
  const permission = await requestNotificationPermission();
  if (!isPermissionGranted(permission)) {
    return {
      ok: false,
      message:
        'Notification permission is required before requesting an FCM token',
      token: null,
    };
  }

  const payload = await buildDeviceTokenPayload(userId);
  if (!payload) {
    return {
      ok: false,
      message:
        'FCM token is not available yet. Use a physical device and valid Firebase config.',
      token: null,
    };
  }

  const previous = await getSavedFcmToken();
  if (isTokenChanged(previous, payload.fcmToken)) {
    await saveFcmToken(payload.fcmToken);
  }

  const result = await registerDeviceToken(payload);
  return { ...result, token: payload.fcmToken };
}

export async function removeDeviceToken(): Promise<TokenRegistrationResult> {
  const token = await getSavedFcmToken();
  if (token) {
    await unregisterDeviceToken(token);
  }
  await clearSavedFcmToken();
  return { ok: true, message: 'Device token cleared' };
}

export async function subscribeDefaultTopic(): Promise<void> {
  await subscribeToTopic(messaging, DEFAULT_TOPIC);
}

export async function unsubscribeDefaultTopic(): Promise<void> {
  await unsubscribeFromTopic(messaging, DEFAULT_TOPIC);
}

export function listenForForegroundMessages(
  onNotification: (notification: AppNotification) => void,
): () => void {
  return onMessage(messaging, async remoteMessage => {
    const notification = parseRemoteMessage(remoteMessage);
    await appendNotificationLog(notification);
    onNotification(notification);
  });
}

export function listenForTokenRefresh(
  onToken: (token: string) => void,
): () => void {
  return onTokenRefresh(messaging, async (token: string) => {
    await saveFcmToken(token);
    await registerDeviceToken(
      mapDeviceToken({
        fcmToken: token,
        apnsToken: await getCurrentApnsToken(),
        platform: platformName,
        appVersion: APP_VERSION,
      }),
    );
    onToken(token);
  });
}

export function listenForNotificationOpened(
  onNotification: (notification: AppNotification) => void,
): () => void {
  return onNotificationOpenedApp(messaging, async remoteMessage => {
    const notification = parseRemoteMessage(remoteMessage);
    await appendNotificationLog(notification);
    onNotification(notification);
  });
}
