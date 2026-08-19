import {
  formatNotificationPreview,
  parseRemoteMessage,
} from '../src/notifications/payload';

describe('parseRemoteMessage', () => {
  it('parses a notification-only payload', () => {
    const result = parseRemoteMessage(
      {
        messageId: 'msg-1',
        notification: { title: 'Payment due', body: 'Your EMI is due today' },
        sentTime: 1700000000000,
      },
      1700000001000,
    );

    expect(result).toMatchObject({
      id: 'msg-1',
      title: 'Payment due',
      body: 'Your EMI is due today',
      kind: 'notification',
      sentAt: 1700000000000,
      receivedAt: 1700000001000,
    });
  });

  it('parses a data-only payload and extracts a deeplink', () => {
    const result = parseRemoteMessage({
      data: {
        title: 'Nominee update',
        body: 'Review your nominee details',
        screen: 'NomineeEdit',
      },
    });

    expect(result.kind).toBe('data');
    expect(result.title).toBe('Nominee update');
    expect(result.deeplink).toBe('NomineeEdit');
  });

  it('marks notification plus data payloads', () => {
    const result = parseRemoteMessage({
      notification: { title: 'Alert', body: 'Open the app' },
      data: { deeplink: 'inbox/42' },
    });

    expect(result.kind).toBe('notification+data');
    expect(result.deeplink).toBe('inbox/42');
  });

  it('stringifies non-string data values', () => {
    const result = parseRemoteMessage({
      data: {
        title: 'Offer',
        payload: { id: 42 },
      },
    });

    expect(result.data.payload).toBe('{"id":42}');
    expect(result.title).toBe('Offer');
  });

  it('falls back to a local id when FCM omits messageId', () => {
    const result = parseRemoteMessage({}, 123);
    expect(result.id).toBe('local-123');
    expect(result.title).toBe('Notification');
  });
});

describe('formatNotificationPreview', () => {
  it('joins title and body', () => {
    expect(
      formatNotificationPreview({
        id: '1',
        title: 'Hello',
        body: 'World',
        data: {},
        sentAt: null,
        receivedAt: 1,
        kind: 'notification',
      }),
    ).toBe('Hello: World');
  });
});
