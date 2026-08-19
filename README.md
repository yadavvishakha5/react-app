# ReactApp — FCM push notifications (Android + iOS)

React Native app with **Firebase Cloud Messaging** for both Android and iOS. It covers permission prompts, FCM token lifecycle, topic subscriptions, foreground / background / quit-state handling, and a small Node server that can register tokens and send test messages.

## What you get

| Layer | Behavior |
| --- | --- |
| Android | `POST_NOTIFICATIONS`, default high-importance channel, white notification icon, `google-services` plugin |
| iOS | Push Notifications entitlement, remote-notification background mode, `FirebaseApp.configure()`, APNs token forwarding |
| JS | Token fetch/refresh, topic subscribe, notification open events, local token cache |
| Server | In-memory device registry + FCM HTTP v1 sender via `firebase-admin` |

Package names:

- Android application id: `com.reactapp`
- iOS bundle id: `com.reactapp`

Replace the placeholder Firebase config files before testing on a device.

## 1. Firebase Console

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
2. Add an **Android** app with package name `com.reactapp`.
3. Download `google-services.json` and replace `android/app/google-services.json`.
4. Add an **iOS** app with bundle id `com.reactapp`.
5. Download `GoogleService-Info.plist` and replace `ios/ReactApp/GoogleService-Info.plist`.
6. Enable **Cloud Messaging** in the project.

Example files are in:

- `android/app/google-services.json.example`
- `ios/GoogleService-Info.plist.example`

## 2. iOS APNs (required for FCM on iPhone)

FCM delivers iOS notifications through APNs.

1. In [Apple Developer](https://developer.apple.com/account/resources/authkeys/list), create a key with **Apple Push Notifications service (APNs)** enabled.
2. Download the `.p8` file and note the Key ID and Team ID.
3. In Firebase Console → Project settings → Cloud Messaging → Apple app configuration, upload the APNs auth key.
4. In Xcode, confirm **Push Notifications** and **Background Modes → Remote notifications + Background fetch** (already encoded in `ReactApp.entitlements` and `Info.plist`).
5. For TestFlight / App Store, set `aps-environment` in `ios/ReactApp/ReactApp.entitlements` to `production`.

Use a **physical iPhone**. Apple Silicon Simulator will not yield a real APNs token.

## 3. Run the app

```bash
npm install
npx react-native start
```

Android:

```bash
npx react-native run-android
```

iOS:

```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

On first launch, tap **Enable notifications**. The dashboard shows permission status, the FCM token, the APNs token on iOS, and incoming messages.

## 4. Send a test notification

### Firebase Console

Cloud Messaging → New campaign → Notifications. Paste the device FCM token, or send to topic `general` after the app has subscribed.

### Node sender

```bash
cd server
npm install
# Save a Firebase Admin SDK JSON key as server/service-account.json
npm run send -- "<FCM_TOKEN>" "Hello" "From the test server"
```

Or run the token registry:

```bash
cd server
npm start
```

Then set `TOKEN_API_URL` in `src/config.ts` to `http://<your-lan-ip>:4000` so the app registers tokens automatically.

`POST /notifications/send` example:

```json
{
  "token": "<FCM_TOKEN>",
  "title": "Nominee update",
  "body": "Your nominee details were saved",
  "data": { "deeplink": "NomineeEdit" }
}
```

Payload notes:

- Android background/quit **data-only** messages need `android.priority = "high"`.
- iOS background/quit **data-only** messages need `content-available: true` and APNs headers. Notification+data messages display automatically when the app is backgrounded or quit.
- Foreground Android messages are surfaced with an in-app alert. iOS can also present a system banner via `messaging_ios_foreground_presentation_options` in `firebase.json`.

## Project layout

```
src/notifications/     permission, token lifecycle, payload parsing, listeners
src/api/               optional backend token registration
android/               channel, icon, google-services, POST_NOTIFICATIONS
ios/ReactApp/          AppDelegate, entitlements, GoogleService-Info.plist
server/                Express registry + firebase-admin sender
```

## Tests

```bash
npm test
npm run test:server
```
