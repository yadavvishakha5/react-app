import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  appendNotificationLog,
  getSavedFcmToken,
  saveFcmToken,
} from '../src/notifications/tokenStore';

describe('tokenStore', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('persists and reads the FCM token', async () => {
    await saveFcmToken('fcm-test-token-abcdefghijklmnopqrstuvwxyz');
    await expect(getSavedFcmToken()).resolves.toBe(
      'fcm-test-token-abcdefghijklmnopqrstuvwxyz',
    );
  });

  it('prepends notifications and de-duplicates by id', async () => {
    const first = {
      id: '1',
      title: 'First',
      body: '',
      data: {},
      sentAt: null,
      receivedAt: 1,
      kind: 'notification' as const,
    };
    const updated = { ...first, title: 'Updated', receivedAt: 2 };
    const second = {
      id: '2',
      title: 'Second',
      body: '',
      data: {},
      sentAt: null,
      receivedAt: 3,
      kind: 'data' as const,
    };

    await appendNotificationLog(first);
    const log = await appendNotificationLog(second);
    const deduped = await appendNotificationLog(updated);

    expect(log[0].id).toBe('2');
    expect(deduped).toHaveLength(2);
    expect(deduped[0].title).toBe('Updated');
  });
});
