import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppShell } from './src/app/AppShell';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#f6f1e8" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f1e8' }}>
        <AppShell />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
