export type DevicePlatform = 'android' | 'ios';

export type PermissionState =
  | 'authorized'
  | 'provisional'
  | 'denied'
  | 'not_determined'
  | 'unavailable';

export type NotificationKind = 'notification' | 'data' | 'notification+data';

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  data: Record<string, string>;
  sentAt: number | null;
  receivedAt: number;
  kind: NotificationKind;
  deeplink?: string;
};

export type DeviceTokenPayload = {
  fcmToken: string;
  apnsToken: string | null;
  platform: DevicePlatform;
  appVersion: string;
  userId?: string;
  registeredAt: string;
};

export type TokenRegistrationResult = {
  ok: boolean;
  message: string;
};

export type FcmRemoteMessageLike = {
  messageId?: string | null;
  messageType?: string | null;
  collapseKey?: string | null;
  from?: string | null;
  sentTime?: number | null;
  notification?: {
    title?: string | null;
    body?: string | null;
  } | null;
  data?: Record<string, string | object> | null;
};
