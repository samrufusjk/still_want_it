import { PermissionsAndroid, Platform } from 'react-native';
import analytics from '@react-native-firebase/analytics';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';

export type ReminderNotificationRoute = {
  itemId: string;
  type: 'decision';
};

export type PushRegistrationResult = {
  status: 'authorized' | 'provisional' | 'denied';
  token?: string;
};

export function formatRemoteMessage(
  remoteMessage: Pick<
    FirebaseMessagingTypes.RemoteMessage,
    'data' | 'messageId' | 'notification'
  >,
) {
  const title = remoteMessage.notification?.title ?? 'No title';
  const body = remoteMessage.notification?.body ?? 'No body';
  const messageId = remoteMessage.messageId ?? 'no-message-id';
  const dataKeys = Object.keys(remoteMessage.data ?? {});

  return `${title} / ${body} / ${messageId} / data: ${
    dataKeys.length ? dataKeys.join(', ') : 'none'
  }`;
}

export async function handleBackgroundMessage(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
) {
  console.log('Background push received', formatRemoteMessage(remoteMessage));
  await analytics().logEvent('push_received_background');
}

function resolveNotificationData(
  remoteMessage: Pick<FirebaseMessagingTypes.RemoteMessage, 'data'> | null,
) {
  if (!remoteMessage?.data) {
    return null;
  }

  const type = remoteMessage.data.type;
  const itemId = remoteMessage.data.itemId;

  if (type !== 'decision_reminder' || typeof itemId !== 'string' || !itemId) {
    return null;
  }

  return {
    itemId,
    type: 'decision' as const,
  };
}

async function requestAndroidNotificationPermission() {
  if (Platform.OS !== 'android' || Number(Platform.Version) < 33) {
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

function resolvePermissionStatus(status: number): PushRegistrationResult['status'] {
  if (status === messaging.AuthorizationStatus.AUTHORIZED) {
    return 'authorized';
  }

  if (status === messaging.AuthorizationStatus.PROVISIONAL) {
    return 'provisional';
  }

  return 'denied';
}

export async function registerForPushNotifications(): Promise<PushRegistrationResult> {
  const hasAndroidPermission = await requestAndroidNotificationPermission();
  if (!hasAndroidPermission) {
    return { status: 'denied' };
  }

  await messaging().registerDeviceForRemoteMessages();
  const authorizationStatus = await messaging().requestPermission();
  const status = resolvePermissionStatus(authorizationStatus);

  if (status === 'denied') {
    return { status };
  }

  const token = await messaging().getToken();
  return { status, token };
}

export async function syncTokenToSignedInUser(
  token: string,
  permissionStatus?: PushRegistrationResult['status'],
) {
  const user = auth().currentUser;
  if (!user) {
    return;
  }

  await firestore()
    .collection('users')
    .doc(user.uid)
    .set(
      {
        email: user.email,
        fcmToken: token,
        lastNotificationPermission: permissionStatus ?? null,
        reminderDelivery: 'fcm',
        updatedAt: firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}

export async function subscribeToTopic(topic: string) {
  await messaging().subscribeToTopic(topic);
}

export async function unsubscribeFromTopic(topic: string) {
  await messaging().unsubscribeFromTopic(topic);
}

export function getNotificationRoute(
  remoteMessage: Pick<FirebaseMessagingTypes.RemoteMessage, 'data'> | null,
) {
  return resolveNotificationData(remoteMessage);
}

export function observeNotificationOpens({
  onForegroundMessage,
  onOpen,
}: {
  onForegroundMessage: (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => void;
  onOpen: (route: ReminderNotificationRoute | null) => void;
}) {
  const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
    onForegroundMessage(remoteMessage);
    await analytics().logEvent('push_received_foreground');
  });

  const unsubscribeOpened = messaging().onNotificationOpenedApp(remoteMessage => {
    onOpen(resolveNotificationData(remoteMessage));
  });

  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      onOpen(resolveNotificationData(remoteMessage));
    });

  return () => {
    unsubscribeForeground();
    unsubscribeOpened();
  };
}
