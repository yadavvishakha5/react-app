import { TOKEN_API_URL } from '../config';
import type {
  DeviceTokenPayload,
  TokenRegistrationResult,
} from '../notifications/types';

export async function registerDeviceToken(
  payload: DeviceTokenPayload,
): Promise<TokenRegistrationResult> {
  if (!TOKEN_API_URL) {
    return {
      ok: true,
      message:
        'Token saved on device. Set TOKEN_API_URL to register with a backend.',
    };
  }

  const response = await fetch(`${TOKEN_API_URL}/devices/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return {
      ok: false,
      message: `Token registration failed (${response.status})`,
    };
  }

  return { ok: true, message: 'Token registered with backend' };
}

export async function unregisterDeviceToken(
  fcmToken: string,
): Promise<TokenRegistrationResult> {
  if (!TOKEN_API_URL) {
    return { ok: true, message: 'Local token cleared' };
  }

  const response = await fetch(`${TOKEN_API_URL}/devices/unregister`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fcmToken }),
  });

  if (!response.ok) {
    return {
      ok: false,
      message: `Token unregistration failed (${response.status})`,
    };
  }

  return { ok: true, message: 'Token removed from backend' };
}
