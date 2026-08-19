import { Platform } from 'react-native';

/**
 * Optional backend used to persist FCM tokens and send test messages.
 * Leave empty to keep tokens on-device only.
 */
export const TOKEN_API_URL = '';

export const DEFAULT_TOPIC = 'general';
export const ANDROID_NOTIFICATION_CHANNEL_ID = 'default';
export const APP_VERSION = '1.0.0';

export const platformName = Platform.OS === 'ios' ? 'ios' : 'android';
