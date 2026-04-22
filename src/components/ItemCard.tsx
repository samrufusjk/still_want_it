import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  canOpenDecision,
  formatCurrency,
  formatItemStateLabel,
} from '../services/items';
import { ItemRecord } from '../types/items';

type ItemCardProps = {
  item: ItemRecord;
  onPress?: () => void;
};

export function ItemCard({ item, onPress }: ItemCardProps) {
  const decisionReady = canOpenDecision(item);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={[styles.card, decisionReady && styles.cardReady]}>
      <View style={styles.row}>
        <Text style={styles.name}>{item.name}</Text>
        {item.priceCents !== null ? (
          <Text style={styles.price}>{formatCurrency(item.priceCents)}</Text>
        ) : null}
      </View>

      <Text style={styles.meta}>{formatItemStateLabel(item)}</Text>
      {item.note ? (
        <Text numberOfLines={2} style={styles.note}>
          {item.note}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fffaf2',
    borderColor: '#ece3d5',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  cardReady: {
    borderColor: '#cfe4d9',
    shadowColor: '#234838',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
  },
  meta: {
    color: '#6b6459',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  name: {
    color: '#16130f',
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    marginRight: 12,
  },
  note: {
    color: '#514b42',
    fontSize: 14,
    lineHeight: 21,
  },
  price: {
    color: '#1f7a5a',
    fontSize: 18,
    fontWeight: '700',
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 10,
  },
});
