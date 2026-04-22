import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ItemCard } from '../components/ItemCard';
import { PlaceholderCard } from '../components/PlaceholderCard';
import { ScreenFrame } from '../components/ScreenFrame';
import { canOpenDecision } from '../services/items';
import { ItemRecord } from '../types/items';

type HomeScreenProps = {
  items: ItemRecord[];
  notificationPreview: string | null;
  onAddItem: () => void;
  onOpenDecision: (item: ItemRecord) => void;
};

export function HomeScreen({
  items,
  notificationPreview,
  onAddItem,
  onOpenDecision,
}: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <ScreenFrame
        eyebrow="Still Want It?"
        subtitle="Pending items stay at the top. Once the wait is over, a tap can move you into the decision moment."
        title="Hold the thought.">
        {notificationPreview ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{notificationPreview}</Text>
          </View>
        ) : null}

        {items.length ? (
          items.map(item => (
            <ItemCard
              item={item}
              key={item.id}
              onPress={canOpenDecision(item) ? () => onOpenDecision(item) : undefined}
            />
          ))
        ) : (
          <PlaceholderCard
            body="Capture your first impulse purchase in a few seconds. The list will keep pending items first and pull you back when the waiting period ends."
            title="No items yet"
          />
        )}
      </ScreenFrame>

      <Pressable accessibilityRole="button" onPress={onAddItem} style={styles.fab}>
        <Text style={styles.fabLabel}>Add Item</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#eef6f1',
    borderColor: '#d2e8dc',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  bannerText: {
    color: '#215740',
    fontSize: 14,
    lineHeight: 20,
  },
  container: {
    flex: 1,
  },
  fab: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#1f7a5a',
    borderRadius: 999,
    bottom: 24,
    paddingHorizontal: 22,
    paddingVertical: 16,
    position: 'absolute',
    shadowColor: '#26493d',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  fabLabel: {
    color: '#fffef9',
    fontSize: 16,
    fontWeight: '700',
  },
});
