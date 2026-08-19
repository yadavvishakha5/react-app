const {sendPush} = require('./fcm');

async function main() {
  const token = process.argv[2];
  const title = process.argv[3] || 'FCM test';
  const body = process.argv[4] || 'Hello from the ReactApp test sender';

  if (!token) {
    console.error(
      'Usage: npm run send -- <fcm-token> [title] [body]\n   or: node sendNotification.js <fcm-token> [title] [body]',
    );
    process.exit(1);
  }

  const messageId = await sendPush({
    token,
    title,
    body,
    data: {
      deeplink: 'inbox',
      source: 'cli',
    },
  });

  console.log('Sent:', messageId);
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
