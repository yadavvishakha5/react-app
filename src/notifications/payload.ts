import type {
  AppNotification,
  FcmRemoteMessageLike,
  NotificationKind,
} from './types';

function asText(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function normalizeData(
  data: Record<string, string | object> | null | undefined,
): Record<string, string> {
  if (!data) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      typeof value === 'string' ? value : JSON.stringify(value),
    ]),
  );
}

function resolveKind(message: FcmRemoteMessageLike): NotificationKind {
  const hasNotification = Boolean(
    message.notification?.title || message.notification?.body,
  );
  const data = normalizeData(message.data);
  const hasData = Object.keys(data).length > 0;

  if (hasNotification && hasData) {
    return 'notification+data';
  }
  if (hasNotification) {
    return 'notification';
  }
  return 'data';
}

function resolveDeeplink(data: Record<string, string>): string | undefined {
  return (
    data.deeplink || data.deepLink || data.screen || data.route || undefined
  );
}

export function parseRemoteMessage(
  message: FcmRemoteMessageLike,
  receivedAt = Date.now(),
): AppNotification {
  const data = normalizeData(message.data);
  const kind = resolveKind(message);
  const title =
    asText(message.notification?.title) || asText(data.title) || 'Notification';
  const body = asText(message.notification?.body) || asText(data.body);

  return {
    id: asText(message.messageId) || `local-${receivedAt}`,
    title,
    body,
    data,
    sentAt: typeof message.sentTime === 'number' ? message.sentTime : null,
    receivedAt,
    kind,
    deeplink: resolveDeeplink(data),
  };
}

export function formatNotificationPreview(
  notification: AppNotification,
): string {
  if (notification.body) {
    return `${notification.title}: ${notification.body}`;
  }
  return notification.title;
}
