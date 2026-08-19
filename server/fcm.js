const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

function getMessaging() {
  if (admin.apps.length === 0) {
    if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      throw new Error(
        'Missing server/service-account.json. Download a Firebase Admin SDK key and place it there.',
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert(require(SERVICE_ACCOUNT_PATH)),
    });
  }

  return admin.messaging();
}

function buildMessage({token, title, body, data = {}, topic}) {
  const notification = {
    title: title || 'ReactApp',
    body: body || 'Test notification from FCM',
  };
  const stringData = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, String(value)]),
  );

  return {
    ...(token ? {token} : {topic: topic || 'general'}),
    notification,
    data: stringData,
    android: {
      priority: 'high',
      notification: {
        channelId: 'default',
        color: '#0B6E4F',
        sound: 'default',
      },
    },
    apns: {
      payload: {
        aps: {
          alert: notification,
          sound: 'default',
          badge: 1,
        },
      },
    },
  };
}

async function sendPush(options) {
  const message = buildMessage(options);
  return getMessaging().send(message);
}

module.exports = {buildMessage, sendPush, getMessaging};
