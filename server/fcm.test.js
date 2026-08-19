const {buildMessage} = require('./fcm');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const tokenMessage = buildMessage({
  token: 'abc',
  title: 'Hello',
  body: 'World',
  data: {screen: 'Home'},
});

assert(tokenMessage.token === 'abc', 'token target is missing');
assert(tokenMessage.notification.title === 'Hello', 'title mismatch');
assert(tokenMessage.data.screen === 'Home', 'data values must be strings');
assert(tokenMessage.android.notification.channelId === 'default', 'android channel missing');
assert(tokenMessage.apns.payload.aps.sound === 'default', 'apns sound missing');

const topicMessage = buildMessage({topic: 'general'});
assert(topicMessage.topic === 'general', 'topic target is missing');
assert(!topicMessage.token, 'topic messages should not include a token');

console.log('server/fcm tests passed');
