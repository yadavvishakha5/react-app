import type { DevicePlatform, DeviceTokenPayload } from './types';

export function isValidFcmToken(token: string | null | undefined): boolean {
  return typeof token === 'string' && token.trim().length > 20;
}

export function isTokenChanged(
  previous: string | null | undefined,
  next: string,
): boolean {
  return previous !== next;
}

export function mapDeviceToken(input: {
  fcmToken: string;
  apnsToken?: string | null;
  platform: DevicePlatform;
  appVersion: string;
  userId?: string;
  registeredAt?: Date;
}): DeviceTokenPayload {
  if (!isValidFcmToken(input.fcmToken)) {
    throw new Error('A valid FCM registration token is required');
  }

  return {
    fcmToken: input.fcmToken.trim(),
    apnsToken: input.platform === 'ios' ? input.apnsToken ?? null : null,
    platform: input.platform,
    appVersion: input.appVersion,
    userId: input.userId,
    registeredAt: (input.registeredAt ?? new Date()).toISOString(),
  };
}
