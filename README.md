## Stack

- Frontend: React Native CLI
- Backend: Firebase
- Auth: Firebase Authentication
- Database: Cloud Firestore
- Notifications: Firebase Cloud Messaging
- Analytics: Firebase Analytics

## Included Starter Features

- Email/password auth starter flow
- Firestore `users/{uid}` profile document sync
- FCM permission request and token fetch
- FCM token sync into Firestore for the signed-in user
- Topic subscribe/unsubscribe example
- Foreground, cold-start, opened-from-notification, and background message hooks
- Firebase Analytics event logging for key actions

## Firebase Setup

1. Create a Firebase project.
2. Add an Android app with package name `com.stillwantit`.
3. Add an iOS app with bundle ID matching the Xcode target bundle identifier.
4. Enable Authentication providers you want to use.
   This starter uses email/password in the UI, so enable Email/Password in Firebase Auth.
5. Create a Firestore database.
6. In Firebase Console > Project settings > Cloud Messaging, upload your APNs authentication key for iOS push.

## Native Credential Files

### Android

Download `google-services.json` from Firebase and place it at:

```sh
android/app/google-services.json
```

### iOS

Download `GoogleService-Info.plist`, then add it to the Xcode project and make sure it is copied into the app target.

Recommended location:

```sh
ios/still_want_it/GoogleService-Info.plist
```

## iOS Push Requirements

Before testing push on iOS, open the project in Xcode and enable:

- `Signing & Capabilities` > `Push Notifications`
- `Signing & Capabilities` > `Background Modes` > `Remote notifications`

The Firebase APNs key must also be uploaded in the Firebase console, otherwise iOS pushes will not arrive.

## Install and Run

```sh
npm install
npm run pods
npm start
```

In a second terminal:

```sh
npm run android
```

Or for iOS:

```sh
npm run ios
```

## Push Notification Notes

- Android 13+ requires runtime notification permission. The app requests it from the starter UI.
- iOS requires both notification permission and valid APNs setup.
- Background handling is registered in `index.js`.
- Foreground messages are received in JS, but if you want rich local presentation while the app is open, add a dedicated local notification layer such as Notifee later.

## Important Files

- `App.tsx`: starter app UI and Firebase flows
- `src/services/notifications.ts`: FCM registration, topic subscription, token sync, background handler
- `android/app/build.gradle`: Google Services plugin
- `ios/Podfile`: static frameworks for React Native Firebase
