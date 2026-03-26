import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows, BorderRadius, Typography, Spacing } from '../../utils/colors';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradientColors: [string, string];
  subtitle?: string;
  style?: ViewStyle;
}

const StatCard: React.FC<StatCardProps> = ({
  title, value, icon, gradientColors, subtitle, style,
}) => {
  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={[styles.card, Shadows.md, style]}
    >
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>{icon}</View>
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    minWidth: 150,
    minHeight: 120,
    justifyContent: 'flex-end',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 'auto',
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  value: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.white,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightMedium,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  subtitle: {
    fontSize: Typography.fontSizeXs,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
});

export default StatCard;
