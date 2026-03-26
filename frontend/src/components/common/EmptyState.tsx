import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../utils/colors';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nothing here yet',
  message = 'No records found.',
  icon = 'folder-open-outline',
}) => (
  <View style={styles.container}>
    <View style={styles.iconCircle}>
      <Ionicons name={icon} size={40} color={Colors.primary} />
    </View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 80, paddingHorizontal: Spacing.xl,
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSizeLg, fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
  },
  message: {
    marginTop: 6, fontSize: Typography.fontSizeSm,
    color: Colors.textMuted, textAlign: 'center',
  },
});

export default EmptyState;
