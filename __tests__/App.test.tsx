/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('@react-native-firebase/analytics', () => () => ({
  logEvent: jest.fn(),
  logLogin: jest.fn(),
  logSignUp: jest.fn(),
}));

jest.mock('@react-native-firebase/auth', () => {
  const anonymousUser = { uid: 'anonymous-user' };
  const authInstance = {
    createUserWithEmailAndPassword: jest.fn(),
    currentUser: anonymousUser,
    onAuthStateChanged: jest.fn(() => jest.fn()),
    signInAnonymously: jest.fn(() => Promise.resolve({ user: anonymousUser })),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
  };

  return () => authInstance;
});

jest.mock('@react-native-firebase/firestore', () => {
  const query = {
    onSnapshot: jest.fn((onNext: (value: { docs: [] }) => void) => {
      onNext({ docs: [] });
      return jest.fn();
    }),
  };
  const collectionRef = {
    add: jest.fn(() => Promise.resolve()),
    doc: jest.fn(() => ({
      onSnapshot: jest.fn(() => jest.fn()),
      set: jest.fn(),
      update: jest.fn(() => Promise.resolve()),
    })),
    where: jest.fn(() => query),
  };
  const firestoreInstance = {
    collection: jest.fn(() => collectionRef),
  };

  return Object.assign(() => firestoreInstance, {
    FieldValue: {
      serverTimestamp: jest.fn(() => 'timestamp'),
    },
    Timestamp: {
      fromDate: jest.fn((value: Date) => value),
    },
  });
});

jest.mock('@react-native-firebase/messaging', () => {
  const messagingInstance = {
    getInitialNotification: jest.fn(() => Promise.resolve(null)),
    getToken: jest.fn(() => Promise.resolve('token')),
    onMessage: jest.fn(() => jest.fn()),
    onNotificationOpenedApp: jest.fn(() => jest.fn()),
    onTokenRefresh: jest.fn(() => jest.fn()),
    registerDeviceForRemoteMessages: jest.fn(() => Promise.resolve()),
    requestPermission: jest.fn(() => Promise.resolve(1)),
    setBackgroundMessageHandler: jest.fn(),
    subscribeToTopic: jest.fn(() => Promise.resolve()),
    unsubscribeFromTopic: jest.fn(() => Promise.resolve()),
  };

  return Object.assign(() => messagingInstance, {
    AuthorizationStatus: {
      AUTHORIZED: 1,
      PROVISIONAL: 2,
    },
  });
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
