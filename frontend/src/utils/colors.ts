// ─── LorryLog Design System — v2 (Refined Industrial) ───────────────────────

export const Colors = {
  // Brand — Steel / Copper
  primary: '#2F4858',
  primaryDark: '#223642',
  primaryLight: '#54707F',
  primaryBg: '#E8EEF1',
  primaryUltraLight: '#F3F6F7',

  secondary: '#C7772E',
  secondaryDark: '#A86123',
  secondaryBg: '#F6ECE3',

  // Status
  success: '#3E7C59',
  successBg: '#E8F1EC',
  warning: '#B27A24',
  warningBg: '#F7F0E3',
  danger: '#B54A3A',
  dangerBg: '#F8E9E6',
  info: '#4D6B7A',
  infoBg: '#E9EFF2',

  // Neutral
  white: '#FFFFFF',
  black: '#1B1D1E',
  gray50: '#F7F6F4',
  gray100: '#EFEDE9',
  gray200: '#E4E1DB',
  gray300: '#D6D2CA',
  gray400: '#B6B2AA',
  gray500: '#949089',
  gray600: '#77746F',
  gray700: '#5F5D59',
  gray800: '#454542',
  gray900: '#2E302F',

  // Background
  bgPrimary: '#F2F1EE',
  bgCard: '#FBFAF8',
  bgElevated: '#FFFFFF',

  // Text
  textPrimary: '#1F2326',
  textSecondary: '#5E6367',
  textMuted: '#888D92',
  textInverse: '#FFFFFF',

  // Border
  border: '#DFDCD6',
  borderFocus: '#2F4858',

  // Chart colors
  chart: {
    teal: '#3D6670',
    orange: '#C7772E',
    blue: '#4D6B7A',
    green: '#3E7C59',
    purple: '#6A5A76',
    cyan: '#5F8A92',
  },
};

export const Shadows = {
  sm: {
    shadowColor: '#1F2326',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#1F2326',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1F2326',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  card: {
    shadowColor: '#223642',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
};

export const Typography = {
  fontSizeXs: 11,
  fontSizeSm: 13,
  fontSizeMd: 15,
  fontSizeLg: 17,
  fontSizeXl: 22,
  fontSize2xl: 28,
  fontSize3xl: 34,
  fontWeightRegular: '400' as const,
  fontWeightMedium: '500' as const,
  fontWeightSemiBold: '600' as const,
  fontWeightBold: '700' as const,
  fontWeightBlack: '800' as const,
  lineHeightSm: 18,
  lineHeightMd: 22,
  lineHeightLg: 28,
};
