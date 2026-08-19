const express = require('express');
const {sendPush} = require('./fcm');

const app = express();
const port = process.env.PORT || 4000;
const tokens = new Map();

app.use(express.json());

app.post('/devices/register', (req, res) => {
  const {fcmToken, platform, apnsToken, userId, appVersion} = req.body || {};
  if (!fcmToken || typeof fcmToken !== 'string') {
    res.status(400).json({ok: false, message: 'fcmToken is required'});
    return;
  }

  tokens.set(fcmToken, {
    fcmToken,
    platform,
    apnsToken: apnsToken || null,
    userId: userId || null,
    appVersion: appVersion || null,
    registeredAt: new Date().toISOString(),
  });

  res.json({ok: true, message: 'Token registered', count: tokens.size});
});

app.post('/devices/unregister', (req, res) => {
  const {fcmToken} = req.body || {};
  if (fcmToken) {
    tokens.delete(fcmToken);
  }
  res.json({ok: true, message: 'Token removed', count: tokens.size});
});

app.get('/devices', (_req, res) => {
  res.json({ok: true, devices: Array.from(tokens.values())});
});

app.post('/notifications/send', async (req, res) => {
  try {
    const {token, topic, title, body, data} = req.body || {};
    if (!token && !topic) {
      res.status(400).json({ok: false, message: 'Provide token or topic'});
      return;
    }

    const messageId = await sendPush({token, topic, title, body, data});
    res.json({ok: true, messageId});
  } catch (error) {
    res.status(500).json({ok: false, message: error.message});
  }
});

app.listen(port, () => {
  console.log(`FCM token server listening on http://localhost:${port}`);
});
