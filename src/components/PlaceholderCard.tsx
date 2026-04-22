import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type PlaceholderCardProps = {
  body: string;
  title: string;
};

export function PlaceholderCard({ body, title }: PlaceholderCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: '#655f55',
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#fffaf2',
    borderColor: '#ece3d5',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#3b3328',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
  },
  title: {
    color: '#1d1914',
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 8,
  },
});
