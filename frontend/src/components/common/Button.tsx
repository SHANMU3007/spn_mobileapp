import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet,
  ActivityIndicator, ViewStyle, TextStyle,
} from 'react-native';
import { Colors, BorderRadius, Typography, Spacing } from '../../utils/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({
  title, onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style, textStyle,
  fullWidth = false,
  size = 'md',
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.white}
        />
      ) : (
        <Text style={[styles.text, textStyles[variant], textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  text: {
    fontWeight: Typography.fontWeightSemiBold,
    letterSpacing: 0.3,
  },
});

const sizeStyles = StyleSheet.create({
  sm: { paddingVertical: 8, paddingHorizontal: Spacing.md },
  md: { paddingVertical: 14, paddingHorizontal: Spacing.lg },
  lg: { paddingVertical: 18, paddingHorizontal: Spacing.xl },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.secondary },
  danger: { backgroundColor: Colors.danger },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  ghost: { backgroundColor: Colors.primaryBg },
});

const textStyles = StyleSheet.create({
  primary: { color: Colors.white, fontSize: Typography.fontSizeMd },
  secondary: { color: Colors.white, fontSize: Typography.fontSizeMd },
  danger: { color: Colors.white, fontSize: Typography.fontSizeMd },
  outline: { color: Colors.primary, fontSize: Typography.fontSizeMd },
  ghost: { color: Colors.primary, fontSize: Typography.fontSizeMd },
});

export default Button;
