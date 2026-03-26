import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';

import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <ScrollView contentContainerStyle={styles.errorScroll}>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorMessage}>{this.state.error?.message}</Text>
            <Text style={styles.errorStack}>{this.state.error?.stack}</Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  errorScroll: {
    paddingTop: 60,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  errorStack: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <AppNavigator />
          <Toast />
          <StatusBar style="auto" />
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
