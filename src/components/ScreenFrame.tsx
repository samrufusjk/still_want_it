import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

type ScreenFrameProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function ScreenFrame({
  eyebrow,
  title,
  subtitle,
  children,
}: ScreenFrameProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.body}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: 16,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  eyebrow: {
    color: '#857e73',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: '#6f685d',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
  },
  title: {
    color: '#16130f',
    fontSize: 38,
    fontWeight: '700',
    lineHeight: 42,
    marginBottom: 12,
  },
});
