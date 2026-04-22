import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import analytics from '@react-native-firebase/analytics';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  formatRemoteMessage,
  handleBackgroundMessage,
  registerForPushNotifications,
  subscribeToTopic,
  syncTokenToSignedInUser,
  unsubscribeFromTopic,
} from './src/services/notifications';

type UserProfile = {
  createdAt?: unknown;
  email: string | null;
  fcmToken?: string;
  lastNotificationPermission?: string;
  updatedAt?: unknown;
};

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safeArea}>
        <AppContent />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [email, setEmail] = useState('hello@stillwantit.app');
  const [password, setPassword] = useState('Passw0rd!');
  const [currentUser, setCurrentUser] = useState<FirebaseAuthTypes.User | null>(
    null,
  );
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fcmToken, setFcmToken] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const isSignedIn = Boolean(currentUser);
  const cardTone = useMemo(
    () => (isSignedIn ? styles.cardSuccess : styles.cardNeutral),
    [isSignedIn],
  );

  const appendLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(existing => [`${timestamp}  ${message}`, ...existing].slice(0, 8));
  };

  useEffect(() => {
    analytics().logEvent('app_bootstrapped');

    const unsubscribeAuth = auth().onAuthStateChanged(user => {
      setCurrentUser(user);
      appendLog(user ? `Signed in as ${user.email ?? user.uid}` : 'Signed out');
    });

    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      appendLog(`Foreground push: ${formatRemoteMessage(remoteMessage)}`);
      await analytics().logEvent('push_received_foreground');
    });

    const unsubscribeOpened = messaging().onNotificationOpenedApp(
      remoteMessage => {
        appendLog(`Opened from push: ${formatRemoteMessage(remoteMessage)}`);
      },
    );

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          appendLog(`Cold start from push: ${formatRemoteMessage(remoteMessage)}`);
        }
      });

    const unsubscribeRefresh = messaging().onTokenRefresh(async token => {
      setFcmToken(token);
      appendLog('FCM token refreshed');
      await syncTokenToSignedInUser(token);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeForeground();
      unsubscribeOpened();
      unsubscribeRefresh();
    };
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    const unsubscribeProfile = firestore()
      .collection('users')
      .doc(currentUser.uid)
      .onSnapshot(documentSnapshot => {
        if (documentSnapshot.exists()) {
          setProfile(documentSnapshot.data() as UserProfile);
        }
      });

    return unsubscribeProfile;
  }, [currentUser]);

  const runTask = async (task: () => Promise<void>) => {
    try {
      setIsBusy(true);
      await task();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown Firebase error';
      appendLog(`Error: ${message}`);
      Alert.alert('Request failed', message);
    } finally {
      setIsBusy(false);
    }
  };

  const signUp = async () => {
    await runTask(async () => {
      const credential = await auth().createUserWithEmailAndPassword(
        email.trim(),
        password,
      );
      await firestore()
        .collection('users')
        .doc(credential.user.uid)
        .set(
          {
            createdAt: firestore.FieldValue.serverTimestamp(),
            email: credential.user.email,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      appendLog('Email/password account created');
      await analytics().logSignUp({ method: 'password' });
    });
  };

  const signIn = async () => {
    await runTask(async () => {
      await auth().signInWithEmailAndPassword(email.trim(), password);
      appendLog('Signed in with email/password');
      await analytics().logLogin({ method: 'password' });
    });
  };

  const signOutUser = async () => {
    await runTask(async () => {
      await auth().signOut();
      setFcmToken('');
      appendLog('User session cleared');
    });
  };

  const seedProfile = async () => {
    await runTask(async () => {
      if (!currentUser) {
        throw new Error('Sign in first to write Firestore data.');
      }

      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .set(
          {
            createdAt: firestore.FieldValue.serverTimestamp(),
            email: currentUser.email,
            lastNotificationPermission: profile?.lastNotificationPermission ?? null,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );

      appendLog('Firestore profile synced');
      await analytics().logEvent('profile_synced');
    });
  };

  const enablePush = async () => {
    await runTask(async () => {
      const result = await registerForPushNotifications();
      setFcmToken(result.token ?? '');
      appendLog(`Notification permission: ${result.status}`);
      if (result.token) {
        await syncTokenToSignedInUser(result.token, result.status);
      }
      await analytics().logEvent('push_registration_attempt', {
        status: result.status,
      });
    });
  };

  const joinLaunchTopic = async () => {
    await runTask(async () => {
      await subscribeToTopic('launch-updates');
      appendLog('Subscribed to topic: launch-updates');
      await analytics().logEvent('topic_subscribed');
    });
  };

  const leaveLaunchTopic = async () => {
    await runTask(async () => {
      await unsubscribeFromTopic('launch-updates');
      appendLog('Unsubscribed from topic: launch-updates');
      await analytics().logEvent('topic_unsubscribed');
    });
  };

  const testBackgroundHandler = async () => {
    await runTask(async () => {
      await handleBackgroundMessage({
        data: { preview: 'Manual test from starter UI' },
        messageId: 'debug-preview',
      } as never);
      appendLog('Background handler smoke test completed');
    });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.eyebrow}>React Native + Firebase Starter</Text>
      <Text style={styles.title}>still_want_it</Text>
      <Text style={styles.subtitle}>
        Android and iOS app scaffold with Firebase Auth, Firestore, Cloud
        Messaging, and Analytics wired in.
      </Text>

      <View style={[styles.card, cardTone]}>
        <Text style={styles.sectionTitle}>Auth</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#6b7280"
          style={styles.input}
          value={email}
        />
        <TextInput
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#6b7280"
          secureTextEntry
          style={styles.input}
          value={password}
        />
        <View style={styles.buttonRow}>
          <ActionButton disabled={isBusy} label="Sign Up" onPress={signUp} />
          <ActionButton disabled={isBusy} label="Sign In" onPress={signIn} />
        </View>
        <ActionButton
          disabled={!isSignedIn || isBusy}
          label="Sign Out"
          onPress={signOutUser}
          variant="secondary"
        />
        <Text style={styles.metaText}>
          Current user: {currentUser?.email ?? currentUser?.uid ?? 'None'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Firestore + Analytics</Text>
        <ActionButton
          disabled={!isSignedIn || isBusy}
          label="Create / Update Profile Document"
          onPress={seedProfile}
        />
        <Text style={styles.metaText}>
          Profile doc: {profile ? JSON.stringify(profile) : 'No user document yet'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Push Notifications</Text>
        <Text style={styles.bodyText}>
          The app requests notification permission, fetches the FCM token, stores
          it for the signed-in user, and exposes topic subscription actions.
        </Text>
        <ActionButton
          disabled={isBusy}
          label="Enable Push Notifications"
          onPress={enablePush}
        />
        <View style={styles.buttonRow}>
          <ActionButton
            disabled={!fcmToken || isBusy}
            label="Join launch-updates"
            onPress={joinLaunchTopic}
            variant="secondary"
          />
          <ActionButton
            disabled={!fcmToken || isBusy}
            label="Leave Topic"
            onPress={leaveLaunchTopic}
            variant="secondary"
          />
        </View>
        <ActionButton
          disabled={isBusy}
          label="Run Background Handler Test"
          onPress={testBackgroundHandler}
          variant="ghost"
        />
        <Text selectable style={styles.tokenText}>
          {fcmToken || 'No FCM token yet. Enable push notifications first.'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Activity</Text>
        {isBusy ? <ActivityIndicator color="#0f766e" /> : null}
        {logs.map(entry => (
          <Text key={entry} style={styles.logLine}>
            {entry}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

type ActionButtonProps = {
  disabled?: boolean;
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
};

function ActionButton({
  disabled = false,
  label,
  onPress,
  variant = 'primary',
}: ActionButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'ghost' && styles.buttonGhost,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}>
      <Text
        style={[
          styles.buttonLabel,
          variant !== 'primary' && styles.buttonLabelDark,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4efe6',
  },
  contentContainer: {
    gap: 16,
    padding: 20,
  },
  eyebrow: {
    color: '#9a3412',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: '#172554',
    fontSize: 34,
    fontWeight: '800',
  },
  subtitle: {
    color: '#334155',
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#fffdf8',
    borderColor: '#e2e8f0',
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  cardNeutral: {
    borderColor: '#fed7aa',
  },
  cardSuccess: {
    borderColor: '#99f6e4',
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '700',
  },
  bodyText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderRadius: 14,
    borderWidth: 1,
    color: '#0f172a',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#0f766e',
    borderRadius: 14,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 14,
  },
  buttonSecondary: {
    backgroundColor: '#ccfbf1',
  },
  buttonGhost: {
    backgroundColor: '#f1f5f9',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
  buttonLabel: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonLabelDark: {
    color: '#0f172a',
  },
  metaText: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
  },
  tokenText: {
    color: '#1e293b',
    fontSize: 13,
    lineHeight: 18,
  },
  logLine: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
  },
});

export default App;
