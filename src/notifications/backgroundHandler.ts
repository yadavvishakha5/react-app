import { appendNotificationLog } from './tokenStore';
import { parseRemoteMessage } from './payload';
import type { FcmRemoteMessageLike } from './types';

export async function handleBackgroundMessage(
  remoteMessage: FcmRemoteMessageLike,
): Promise<void> {
  const notification = parseRemoteMessage(remoteMessage);
  await appendNotificationLog(notification);
}
