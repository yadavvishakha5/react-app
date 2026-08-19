/**
 * @format
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaConsumer: ({ children }) => children(inset),
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

const messagingInstance = {};

jest.mock('@react-native-firebase/messaging', () => ({
  getMessaging: jest.fn(() => messagingInstance),
  setBackgroundMessageHandler: jest.fn(),
  requestPermission: jest.fn(async () => 1),
  hasPermission: jest.fn(async () => 1),
  getToken: jest.fn(async () => 'fcm-test-token-abcdefghijklmnopqrstuvwxyz'),
  getAPNSToken: jest.fn(async () => null),
  onMessage: jest.fn(() => jest.fn()),
  onTokenRefresh: jest.fn(() => jest.fn()),
  onNotificationOpenedApp: jest.fn(() => jest.fn()),
  getInitialNotification: jest.fn(async () => null),
  registerDeviceForRemoteMessages: jest.fn(async () => undefined),
  subscribeToTopic: jest.fn(async () => undefined),
  unsubscribeFromTopic: jest.fn(async () => undefined),
  AuthorizationStatus: {
    NOT_DETERMINED: -1,
    DENIED: 0,
    AUTHORIZED: 1,
    PROVISIONAL: 2,
  },
}));
