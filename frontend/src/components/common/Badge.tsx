import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getStatusColor, getStatusBg, capitalize } from '../../utils/formatters';
import { Typography, BorderRadius, Spacing } from '../../utils/colors';

interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const Badge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  const color = getStatusColor(status);
  const bg = getStatusBg(status);
  const isSm = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: bg }, isSm && styles.badgeSm]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }, isSm && styles.textSm]}>
        {capitalize(status)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: BorderRadius.full, alignSelf: 'flex-start', gap: 5,
  },
  badgeSm: { paddingHorizontal: 7, paddingVertical: 3 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: Typography.fontSizeSm, fontWeight: Typography.fontWeightSemiBold },
  textSm: { fontSize: Typography.fontSizeXs },
});

export default Badge;
