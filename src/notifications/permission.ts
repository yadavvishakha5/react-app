import { PermissionsAndroid, Platform } from 'react-native';
import {
  AuthorizationStatus,
  getMessaging,
  hasPermission,
  requestPermission,
} from '@react-native-firebase/messaging';
import type { PermissionState } from './types';

function mapAuthorizationStatus(status: number): PermissionState {
  switch (status) {
    case AuthorizationStatus.AUTHORIZED:
      return 'authorized';
    case AuthorizationStatus.PROVISIONAL:
      return 'provisional';
    case AuthorizationStatus.DENIED:
      return 'denied';
    case AuthorizationStatus.NOT_DETERMINED:
      return 'not_determined';
    default:
      return 'unavailable';
  }
}

export async function getNotificationPermission(): Promise<PermissionState> {
  if (Platform.OS === 'android') {
    if (typeof Platform.Version === 'number' && Platform.Version < 33) {
      return 'authorized';
    }

    const result = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result ? 'authorized' : 'denied';
  }

  const status = await hasPermission(getMessaging());
  return mapAuthorizationStatus(status);
}

export async function requestNotificationPermission(): Promise<PermissionState> {
  if (Platform.OS === 'android') {
    if (typeof Platform.Version === 'number' && Platform.Version < 33) {
      return 'authorized';
    }

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );

    if (result === PermissionsAndroid.RESULTS.GRANTED) {
      return 'authorized';
    }
    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      return 'denied';
    }
    return 'denied';
  }

  const status = await requestPermission(getMessaging(), {
    alert: true,
    badge: true,
    sound: true,
    provisional: false,
  });

  return mapAuthorizationStatus(status);
}

export function isPermissionGranted(state: PermissionState): boolean {
  return state === 'authorized' || state === 'provisional';
}
