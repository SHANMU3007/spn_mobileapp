import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../utils/colors';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message, size = 'large', fullScreen = false,
}) => (
  <View style={[styles.container, fullScreen && styles.fullScreen]}>
    <ActivityIndicator size={size} color={Colors.primary} />
    {message ? <Text style={styles.message}>{message}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 32, alignItems: 'center', justifyContent: 'center',
  },
  fullScreen: {
    flex: 1, backgroundColor: Colors.bgPrimary,
  },
  message: {
    marginTop: 14, fontSize: Typography.fontSizeMd,
    color: Colors.textSecondary, letterSpacing: 0.2,
  },
});

export default LoadingSpinner;
