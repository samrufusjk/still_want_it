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
  const authInstance = {
    createUserWithEmailAndPassword: jest.fn(),
    currentUser: null,
    onAuthStateChanged: jest.fn(() => jest.fn()),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
  };

  return () => authInstance;
});

jest.mock('@react-native-firebase/firestore', () => {
  const firestoreInstance = {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        onSnapshot: jest.fn(() => jest.fn()),
        set: jest.fn(),
      })),
    })),
  };

  return Object.assign(() => firestoreInstance, {
    FieldValue: {
      serverTimestamp: jest.fn(() => 'timestamp'),
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
