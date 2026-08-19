import {
  isTokenChanged,
  isValidFcmToken,
  mapDeviceToken,
} from '../src/notifications/tokenMapper';

describe('mapDeviceToken', () => {
  it('maps an Android token without APNs', () => {
    const payload = mapDeviceToken({
      fcmToken: 'fcm-test-token-abcdefghijklmnopqrstuvwxyz',
      platform: 'android',
      appVersion: '1.0.0',
      userId: 'user-1',
      registeredAt: new Date('2026-08-19T00:00:00.000Z'),
    });

    expect(payload).toEqual({
      fcmToken: 'fcm-test-token-abcdefghijklmnopqrstuvwxyz',
      apnsToken: null,
      platform: 'android',
      appVersion: '1.0.0',
      userId: 'user-1',
      registeredAt: '2026-08-19T00:00:00.000Z',
    });
  });

  it('keeps the APNs token for iOS', () => {
    const payload = mapDeviceToken({
      fcmToken: 'fcm-test-token-abcdefghijklmnopqrstuvwxyz',
      apnsToken: 'apns-token',
      platform: 'ios',
      appVersion: '1.0.0',
    });

    expect(payload.apnsToken).toBe('apns-token');
    expect(payload.platform).toBe('ios');
  });

  it('rejects short or empty FCM tokens', () => {
    expect(() =>
      mapDeviceToken({
        fcmToken: 'short',
        platform: 'android',
        appVersion: '1.0.0',
      }),
    ).toThrow('A valid FCM registration token is required');
  });
});

describe('token helpers', () => {
  it('validates token length', () => {
    expect(isValidFcmToken('short')).toBe(false);
    expect(isValidFcmToken('fcm-test-token-abcdefghijklmnopqrstuvwxyz')).toBe(
      true,
    );
  });

  it('detects token rotation', () => {
    expect(isTokenChanged('old-token', 'new-token')).toBe(true);
    expect(isTokenChanged('same-token', 'same-token')).toBe(false);
  });
});
