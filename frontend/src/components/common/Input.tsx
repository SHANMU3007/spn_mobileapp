import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing } from '../../utils/colors';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'decimal-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
  editable?: boolean;
  style?: ViewStyle;
  required?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}

const Input: React.FC<InputProps> = ({
  label, value, onChangeText, placeholder,
  secureTextEntry = false, keyboardType = 'default',
  autoCapitalize = 'sentences', multiline = false,
  numberOfLines = 1, error, editable = true,
  style, required = false, icon,
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}
      <View
        style={[
          styles.inputWrap,
          focused && styles.inputFocused,
          !!error && styles.inputError,
          !editable && styles.inputDisabled,
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon} size={18}
            color={focused ? Colors.primary : Colors.gray400}
            style={styles.prefixIcon}
          />
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.gray400}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.input, multiline && styles.multilineInput]}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20} color={Colors.gray400}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.md },
  label: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  required: { color: Colors.danger },
  prefixIcon: { marginRight: 10 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 1,
  },
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  inputError: { borderColor: Colors.danger },
  inputDisabled: { opacity: 0.5, backgroundColor: Colors.gray100 },
  input: {
    flex: 1,
    fontSize: Typography.fontSizeMd,
    color: Colors.textPrimary,
    paddingVertical: 13,
  },
  multilineInput: { textAlignVertical: 'top', paddingVertical: 12 },
  errorText: {
    marginTop: 4,
    fontSize: Typography.fontSizeXs,
    color: Colors.danger,
  },
});

export default Input;
