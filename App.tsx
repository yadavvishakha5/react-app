import React from 'react';
import {
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  NotificationProvider,
  useNotifications,
} from './src/notifications/NotificationProvider';
import { formatNotificationPreview } from './src/notifications/payload';

function App({ isHeadless }: { isHeadless?: boolean }) {
  const isDarkMode = useColorScheme() === 'dark';

  if (isHeadless) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NotificationProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <HomeScreen />
      </NotificationProvider>
    </SafeAreaProvider>
  );
}

function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    permission,
    fcmToken,
    apnsToken,
    topic,
    subscribedToTopic,
    statusMessage,
    notifications,
    lastOpened,
    initializing,
    enableNotifications,
    refreshToken,
    toggleTopic,
    clearToken,
  } = useNotifications();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
      ]}
      accessible
      accessibilityLabel="FCM push notification dashboard"
    >
      <Text style={styles.title} accessibilityRole="header">
        FCM Push Notifications
      </Text>
      <Text style={styles.subtitle}>
        Firebase Cloud Messaging for Android and iOS, including token lifecycle,
        permission handling, topics, and notification open events.
      </Text>

      <Card title="Permission">
        <StatusRow label="Status" value={permission} />
        <StatusRow label="Setup" value={initializing ? 'Loading' : 'Ready'} />
        <Text style={styles.body}>{statusMessage}</Text>
        <PrimaryButton
          label="Enable notifications"
          onPress={enableNotifications}
          accessibilityHint="Requests notification permission and fetches an FCM token"
        />
      </Card>

      <Card title="Device tokens">
        <StatusRow label="FCM token" value={fcmToken ?? 'Not issued yet'} />
        <StatusRow label="APNs token" value={apnsToken ?? 'iOS only'} />
        <View style={styles.row}>
          <SecondaryButton
            label="Share FCM token"
            disabled={!fcmToken}
            onPress={() =>
              fcmToken && Share.share({ message: fcmToken, title: 'FCM token' })
            }
          />
          <SecondaryButton label="Refresh token" onPress={refreshToken} />
        </View>
        <SecondaryButton label="Clear local token" onPress={clearToken} />
      </Card>

      <Card title="Topics">
        <StatusRow label="Topic" value={topic} />
        <StatusRow
          label="Subscription"
          value={subscribedToTopic ? 'Subscribed' : 'Not subscribed'}
        />
        <PrimaryButton
          label={
            subscribedToTopic
              ? `Unsubscribe from ${topic}`
              : `Subscribe to ${topic}`
          }
          onPress={toggleTopic}
        />
      </Card>

      <Card title="Last opened notification">
        <Text style={styles.body}>
          {lastOpened
            ? formatNotificationPreview(lastOpened)
            : 'Tap a system notification to capture the open event here.'}
        </Text>
        {lastOpened?.deeplink ? (
          <StatusRow label="Deeplink" value={lastOpened.deeplink} />
        ) : null}
      </Card>

      <Card title="Received messages">
        {notifications.length === 0 ? (
          <Text style={styles.body}>
            No messages yet. Send a notification from Firebase Console or the
            included Node server.
          </Text>
        ) : (
          notifications.map(item => (
            <View key={item.id} style={styles.notice}>
              <Text style={styles.noticeTitle}>{item.title}</Text>
              {item.body ? <Text style={styles.body}>{item.body}</Text> : null}
              <Text style={styles.meta}>
                {item.kind} · {new Date(item.receivedAt).toLocaleString()}
              </Text>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statusRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} selectable>
        {value}
      </Text>
    </View>
  );
}

function PrimaryButton({
  label,
  onPress,
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  accessibilityHint?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.secondaryButton,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#102A43',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#334E68',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#102A43',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#102A43',
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
    color: '#334E68',
  },
  statusRow: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#627D98',
  },
  value: {
    fontSize: 15,
    color: '#102A43',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: '#0B6E4F',
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderColor: '#0B6E4F',
    borderWidth: 1.5,
    borderRadius: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    flexGrow: 1,
  },
  secondaryButtonText: {
    color: '#0B6E4F',
    fontSize: 15,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.85,
  },
  notice: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D9E2EC',
    paddingTop: 10,
    gap: 4,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#102A43',
  },
  meta: {
    fontSize: 12,
    color: '#627D98',
  },
});

export default App;
