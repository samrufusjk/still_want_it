import { useEffect, useState } from 'react';
import analytics from '@react-native-firebase/analytics';
import auth from '@react-native-firebase/auth';
import {
  registerForPushNotifications,
  syncTokenToSignedInUser,
} from '../services/notifications';

export function useAppBootstrap() {
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        await analytics().logEvent('app_opened');

        let currentUser = auth().currentUser;
        if (!currentUser) {
          const credential = await auth().signInAnonymously();
          currentUser = credential.user;
          await analytics().logEvent('anonymous_session_started');
        }

        if (!currentUser) {
          throw new Error('Anonymous auth did not return a user.');
        }

        if (!isMounted) {
          return;
        }

        setUserId(currentUser.uid);

        const registration = await registerForPushNotifications();
        if (registration.token) {
          await syncTokenToSignedInUser(registration.token, registration.status);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to bootstrap app';

        if (isMounted) {
          setBootstrapError(message);
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    bootstrapError,
    isBootstrapping,
    userId,
  };
}
