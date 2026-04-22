import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { formatCurrency, formatDecisionReadyLabel } from '../services/items';
import { ItemRecord } from '../types/items';
import { ScreenFrame } from '../components/ScreenFrame';

type DecisionScreenProps = {
  item: ItemRecord;
  onBack: () => void;
  onBuy: (item: ItemRecord) => Promise<void>;
  onSkip: (item: ItemRecord) => Promise<void>;
  saving: boolean;
};

export function DecisionScreen({
  item,
  onBack,
  onBuy,
  onSkip,
  saving,
}: DecisionScreenProps) {
  return (
    <ScreenFrame
      eyebrow="Decision"
      subtitle="A quiet checkpoint after the wait. Choose what still feels right."
      title="Still want it?">
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
        <Text style={styles.backLabel}>Back to list</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.priceCents !== null ? (
          <Text style={styles.itemPrice}>{formatCurrency(item.priceCents)}</Text>
        ) : null}
        <Text style={styles.itemMeta}>{formatDecisionReadyLabel(item)}</Text>
        {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={saving}
        onPress={() => onBuy(item)}
        style={[styles.primaryButton, saving && styles.disabledButton]}>
        {saving ? (
          <ActivityIndicator color="#fffef9" size="small" />
        ) : (
          <Text style={styles.primaryLabel}>Yes, Buy</Text>
        )}
      </Pressable>

      <Pressable
        accessibilityRole="button"
        disabled={saving}
        onPress={() => onSkip(item)}
        style={[styles.secondaryButton, saving && styles.disabledButton]}>
        <Text style={styles.secondaryLabel}>Skip it</Text>
      </Pressable>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backLabel: {
    color: '#5e584e',
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fffaf2',
    borderColor: '#ece3d5',
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 8,
    padding: 24,
  },
  disabledButton: {
    opacity: 0.7,
  },
  itemMeta: {
    color: '#6f685d',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
  },
  itemName: {
    color: '#16130f',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    marginBottom: 12,
  },
  itemPrice: {
    color: '#1f7a5a',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  note: {
    color: '#423d36',
    fontSize: 16,
    lineHeight: 24,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#1f7a5a',
    borderRadius: 24,
    paddingVertical: 18,
  },
  primaryLabel: {
    color: '#fffef9',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#ece4d7',
    borderRadius: 24,
    paddingVertical: 18,
  },
  secondaryLabel: {
    color: '#39352f',
    fontSize: 17,
    fontWeight: '700',
  },
});
