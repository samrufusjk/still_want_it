import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { AddItemSheet } from '../components/AddItemSheet';
import { useAppBootstrap } from '../hooks/useAppBootstrap';
import { useItems } from '../hooks/useItems';
import { ReminderNotificationRoute, getNotificationRoute, observeNotificationOpens } from '../services/notifications';
import { ItemRecord } from '../types/items';
import { DecisionScreen } from '../screens/DecisionScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { StatsScreen } from '../screens/StatsScreen';

type RootScreen = 'home' | 'stats';

const navigationItems: Array<{ key: RootScreen; label: string }> = [
  { key: 'home', label: 'Items' },
  { key: 'stats', label: 'Stats' },
];

export function AppShell() {
  const { bootstrapError, isBootstrapping, userId } = useAppBootstrap();
  const {
    createItem,
    isMutating,
    items,
    itemsError,
    markBought,
    markSkipped,
    stats,
  } = useItems(userId);
  const [activeScreen, setActiveScreen] = useState<RootScreen>('home');
  const [decisionItemId, setDecisionItemId] = useState<string | null>(null);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [notificationPreview, setNotificationPreview] = useState<string | null>(null);

  const decisionItem = items.find(item => item.id === decisionItemId) ?? null;

  useEffect(() => {
    const applyRoute = (route: ReminderNotificationRoute | null) => {
      if (!route || route.type !== 'decision') {
        return;
      }

      setDecisionItemId(route.itemId);
      setActiveScreen('home');
    };

    const handleForegroundNotification = (
      remoteMessage: FirebaseMessagingTypes.RemoteMessage,
    ) => {
      const title = remoteMessage.notification?.title ?? 'Still want it?';
      const body = remoteMessage.notification?.body ?? '';
      const route = getNotificationRoute(remoteMessage);

      setNotificationPreview(body ? `${title}  ${body}` : title);
      applyRoute(route);
    };

    const unsubscribe = observeNotificationOpens({
      onForegroundMessage: handleForegroundNotification,
      onOpen: applyRoute,
    });

    return unsubscribe;
  }, []);

  const closeAddSheet = () => setIsAddSheetOpen(false);

  const handleCreateItem = async (input: {
    delayPreset: ItemRecord['delayPreset'];
    name: string;
    note: string;
    priceInput: string;
  }) => {
    await createItem(input);
    setIsAddSheetOpen(false);
  };

  const handleMarkBought = async (item: ItemRecord) => {
    await markBought(item);
    setDecisionItemId(null);
  };

  const handleMarkSkipped = async (item: ItemRecord) => {
    await markSkipped(item);
    setDecisionItemId(null);
  };

  const activeError = bootstrapError ?? itemsError;

  if (isBootstrapping) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color="#1f7a5a" size="small" />
        <Text style={styles.stateTitle}>Starting quietly…</Text>
        <Text style={styles.stateBody}>
          Creating a lightweight session and preparing your item list.
        </Text>
      </View>
    );
  }

  if (activeError) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.stateTitle}>App setup needs attention.</Text>
        <Text style={styles.stateBody}>{activeError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {decisionItem ? (
        <DecisionScreen
          item={decisionItem}
          onBack={() => setDecisionItemId(null)}
          onBuy={handleMarkBought}
          onSkip={handleMarkSkipped}
          saving={isMutating}
        />
      ) : activeScreen === 'home' ? (
        <HomeScreen
          items={items}
          notificationPreview={notificationPreview}
          onAddItem={() => setIsAddSheetOpen(true)}
          onOpenDecision={item => setDecisionItemId(item.id)}
        />
      ) : (
        <StatsScreen stats={stats} />
      )}

      {!decisionItem ? (
        <View style={styles.bottomBar}>
          {navigationItems.map(item => {
            const isActive = item.key === activeScreen;

            return (
              <Pressable
                accessibilityRole="button"
                key={item.key}
                onPress={() => setActiveScreen(item.key)}
                style={[styles.navItem, isActive && styles.navItemActive]}>
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <Modal
        animationType="slide"
        onRequestClose={closeAddSheet}
        presentationStyle="overFullScreen"
        transparent
        visible={isAddSheetOpen}>
        <AddItemSheet
          onClose={closeAddSheet}
          onSubmit={handleCreateItem}
          submitting={isMutating}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    backgroundColor: '#fffaf2',
    borderTopColor: '#e6ded1',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 18,
    paddingTop: 14,
  },
  centerState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  container: {
    backgroundColor: '#f6f1e8',
    flex: 1,
  },
  navItem: {
    alignItems: 'center',
    backgroundColor: '#efe7d7',
    borderRadius: 18,
    flex: 1,
    paddingVertical: 14,
  },
  navItemActive: {
    backgroundColor: '#1f7a5a',
  },
  navLabel: {
    color: '#5f5b53',
    fontSize: 15,
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#fffef9',
  },
  stateBody: {
    color: '#6f685d',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    textAlign: 'center',
  },
  stateTitle: {
    color: '#16130f',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 18,
    textAlign: 'center',
  },
});
