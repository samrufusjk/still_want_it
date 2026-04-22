import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatCurrency } from '../services/items';
import { ItemStats } from '../types/items';
import { ScreenFrame } from '../components/ScreenFrame';

type StatsScreenProps = {
  stats: ItemStats;
};

export function StatsScreen({ stats }: StatsScreenProps) {
  const cards = [
    { label: 'Money saved', value: formatCurrency(stats.moneySavedCents) },
    { label: 'Items skipped', value: String(stats.itemsSkipped) },
  ];

  return (
    <ScreenFrame
      eyebrow="Stats"
      subtitle="A minimal reflection view. No dashboards, no pressure, just two signals that matter."
      title="Small proof.">
      <View style={styles.grid}>
        {cards.map(card => (
          <View key={card.label} style={styles.card}>
            <Text style={styles.value}>{card.value}</Text>
            <Text style={styles.label}>{card.label}</Text>
          </View>
        ))}
      </View>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fffaf2',
    borderColor: '#ece3d5',
    borderRadius: 24,
    borderWidth: 1,
    flex: 1,
    minHeight: 160,
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
  },
  label: {
    color: '#6b6459',
    fontSize: 15,
    fontWeight: '500',
  },
  value: {
    color: '#16130f',
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 10,
  },
});
