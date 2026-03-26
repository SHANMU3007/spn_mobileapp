import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../utils/colors';

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'At least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err: any) {
      const isNetworkError = !err?.response;
      const msg = isNetworkError
        ? `Cannot reach backend at ${API_BASE_URL}. Make sure backend is running and phone/emulator can access your PC.`
        : (err?.response?.data?.message || 'Login failed. Please try again.');
      Toast.show({ type: 'error', text1: 'Login Failed', text2: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top decorative wave */}
      <LinearGradient
        colors={[Colors.primaryLight, Colors.primary, Colors.primaryDark]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.topWave}
      >
        <View style={styles.circleDecor1} />
        <View style={styles.circleDecor2} />
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoArea}>
            <View style={[styles.logoCircle, Shadows.lg]}>
              <Ionicons name="bus" size={36} color={Colors.primary} />
            </View>
            <Text style={styles.appName}>SPN Transport</Text>
            <Text style={styles.tagline}>Lorry Log Management System</Text>
          </View>

          {/* Card */}
          <View style={[styles.card, Shadows.lg]}>
            <Text style={styles.welcomeTitle}>Welcome back</Text>
            <Text style={styles.welcomeSub}>Sign in to your account</Text>

            <View style={styles.form}>
              <Input
                label="Email Address"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
                }}
                placeholder="admin@spn.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                required
              />
              <Input
                label="Password"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
                }}
                placeholder="Enter your password"
                secureTextEntry
                error={errors.password}
                required
              />
            </View>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              fullWidth
              style={styles.signInBtn}
            />

            <View style={styles.footer}>
              <Ionicons name="shield-checkmark-outline" size={14} color={Colors.primary} />
              <Text style={styles.footerText}>Secured with JWT authentication</Text>
            </View>
          </View>

          <Text style={styles.version}>SPN Transport v1.0.0</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  flex: { flex: 1 },
  topWave: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 280,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  circleDecor1: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circleDecor2: {
    position: 'absolute', bottom: -20, left: -30,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  logoArea: { alignItems: 'center', marginBottom: Spacing.xl },
  logoCircle: {
    width: 80, height: 80, borderRadius: BorderRadius.xl,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: Typography.fontSizeSm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    paddingTop: 28,
    paddingBottom: 24,
  },
  welcomeTitle: {
    fontSize: Typography.fontSizeXl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  welcomeSub: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  form: { marginBottom: 4 },
  signInBtn: { marginTop: Spacing.sm },
  footer: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    marginTop: Spacing.md,
  },
  footerText: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textMuted,
  },
  version: {
    textAlign: 'center',
    marginTop: Spacing.lg,
    fontSize: Typography.fontSizeXs,
    color: Colors.textMuted,
  },
});

export default LoginScreen;
