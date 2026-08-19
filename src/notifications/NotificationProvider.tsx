import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Alert, Platform } from 'react-native';
import {
  getInitialNotification,
  getMessaging,
} from '@react-native-firebase/messaging';
import { DEFAULT_TOPIC } from '../config';
import {
  listenForForegroundMessages,
  listenForNotificationOpened,
  listenForTokenRefresh,
  removeDeviceToken,
  subscribeDefaultTopic,
  syncDeviceToken,
  unsubscribeDefaultTopic,
  getCurrentApnsToken,
} from './fcmService';
import { parseRemoteMessage } from './payload';
import { getNotificationPermission } from './permission';
import { getNotificationLog } from './tokenStore';
import type { AppNotification, PermissionState } from './types';

type NotificationContextValue = {
  permission: PermissionState;
  fcmToken: string | null;
  apnsToken: string | null;
  topic: string;
  subscribedToTopic: boolean;
  statusMessage: string;
  notifications: AppNotification[];
  lastOpened: AppNotification | null;
  initializing: boolean;
  enableNotifications: () => Promise<void>;
  refreshToken: () => Promise<void>;
  toggleTopic: () => Promise<void>;
  clearToken: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [permission, setPermission] =
    useState<PermissionState>('not_determined');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [apnsToken, setApnsToken] = useState<string | null>(null);
  const [subscribedToTopic, setSubscribedToTopic] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    'Notifications are not enabled yet',
  );
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [lastOpened, setLastOpened] = useState<AppNotification | null>(null);
  const [initializing, setInitializing] = useState(true);

  const handleIncoming = useCallback((notification: AppNotification) => {
    setNotifications(current => [
      notification,
      ...current.filter(item => item.id !== notification.id),
    ]);

    if (Platform.OS === 'android') {
      Alert.alert(
        notification.title,
        notification.body || 'New data message received',
      );
    }
  }, []);

  const handleOpened = useCallback((notification: AppNotification) => {
    setLastOpened(notification);
    setNotifications(current => [
      notification,
      ...current.filter(item => item.id !== notification.id),
    ]);
  }, []);

  const refreshToken = useCallback(async () => {
    const result = await syncDeviceToken();
    setFcmToken(result.token);
    setApnsToken(await getCurrentApnsToken());
    setPermission(await getNotificationPermission());
    setStatusMessage(result.message);
  }, []);

  const enableNotifications = useCallback(async () => {
    await refreshToken();
    try {
      await subscribeDefaultTopic();
      setSubscribedToTopic(true);
    } catch (error) {
      console.warn('Topic subscription failed', error);
    }
  }, [refreshToken]);

  const toggleTopic = useCallback(async () => {
    if (subscribedToTopic) {
      await unsubscribeDefaultTopic();
      setSubscribedToTopic(false);
      setStatusMessage(`Unsubscribed from ${DEFAULT_TOPIC}`);
      return;
    }

    await subscribeDefaultTopic();
    setSubscribedToTopic(true);
    setStatusMessage(`Subscribed to ${DEFAULT_TOPIC}`);
  }, [subscribedToTopic]);

  const clearToken = useCallback(async () => {
    const result = await removeDeviceToken();
    setFcmToken(null);
    setApnsToken(null);
    setStatusMessage(result.message);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const [currentPermission, log, initial] = await Promise.all([
        getNotificationPermission(),
        getNotificationLog(),
        getInitialNotification(getMessaging()),
      ]);

      if (cancelled) {
        return;
      }

      setPermission(currentPermission);
      setNotifications(log);

      if (initial) {
        handleOpened(parseRemoteMessage(initial));
      }

      if (
        currentPermission === 'authorized' ||
        currentPermission === 'provisional'
      ) {
        await refreshToken();
      }

      setInitializing(false);
    }

    const unsubscribeForeground = listenForForegroundMessages(handleIncoming);
    const unsubscribeOpened = listenForNotificationOpened(handleOpened);
    const unsubscribeRefresh = listenForTokenRefresh(token => {
      setFcmToken(token);
      setStatusMessage('FCM token refreshed');
    });

    bootstrap().catch(error => {
      console.warn('FCM bootstrap failed', error);
      setInitializing(false);
    });

    return () => {
      cancelled = true;
      unsubscribeForeground();
      unsubscribeOpened();
      unsubscribeRefresh();
    };
  }, [handleIncoming, handleOpened, refreshToken]);

  const value = useMemo(
    () => ({
      permission,
      fcmToken,
      apnsToken,
      topic: DEFAULT_TOPIC,
      subscribedToTopic,
      statusMessage,
      notifications,
      lastOpened,
      initializing,
      enableNotifications,
      refreshToken,
      toggleTopic,
      clearToken,
    }),
    [
      permission,
      fcmToken,
      apnsToken,
      subscribedToTopic,
      statusMessage,
      notifications,
      lastOpened,
      initializing,
      enableNotifications,
      refreshToken,
      toggleTopic,
      clearToken,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const value = useContext(NotificationContext);
  if (!value) {
    throw new Error(
      'useNotifications must be used within NotificationProvider',
    );
  }
  return value;
}
