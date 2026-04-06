import { useColorScheme } from 'react-native';

// ---------------------------------------------------------------------------
// Primitive palette — raw color values, not for direct use in components
// ---------------------------------------------------------------------------
const palette = {
  // Greens
  green500: '#22c55e',
  // Teals
  teal400: '#2dd4bf',
  // Yellows
  yellow400: '#facc15',
  yellow500: '#eab308',
  // Oranges
  orange500: '#f97316',
  // Reds
  red400: '#f87171',
  red500: '#ef4444',
  red600: '#dc2626',
  red200: '#fecaca',
  // Blues
  blue400: '#60a5fa',
  blue500: '#3b82f6',
  blue600: '#2563eb',
  // Purples
  purple500: '#a855f7',
  // Neutrals
  white: '#ffffff',
  black: '#000000',
  gray50: '#f5f5f5',
  gray100: '#f5f5f5',
  gray200: '#e5e7eb',
  gray300: '#374151',
  gray400: '#6b7280',
  gray500: '#9ca3af',
  gray900: '#1a1a1a',
  surface_dark: '#1c1c1e',
} as const;

// ---------------------------------------------------------------------------
// Semantic colors — alertness domain
// ---------------------------------------------------------------------------
export const alertnessColors = {
  excellent: palette.green500,
  good: palette.teal400,
  fair: palette.yellow500,
  poor: palette.orange500,
  veryPoor: palette.red500,
} as const;

// ---------------------------------------------------------------------------
// Semantic colors — achievement categories
// ---------------------------------------------------------------------------
export const categoryColors = {
  consistency: palette.blue500,
  speed: palette.orange500,
  focus: palette.green500,
  milestone: palette.purple500,
} as const;

// ---------------------------------------------------------------------------
// Theme-adaptive colors (light/dark)
// ---------------------------------------------------------------------------
export const colors = {
  light: {
    background: palette.white,
    surface: palette.gray100,
    text: palette.gray900,
    textSecondary: palette.gray400,
    border: palette.gray200,
    accent: palette.blue600,
    caffeineAccent: palette.blue500,
    danger: palette.red500,
    dangerSubtle: palette.red200,
    success: palette.green500,
    warning: palette.yellow500,
    alertBanner: palette.red600,
    onAlertBanner: palette.white,
    onAlertBannerSubtle: palette.red200,
    cardBackground: palette.gray100,
  },
  dark: {
    background: palette.black,
    surface: palette.surface_dark,
    text: palette.white,
    textSecondary: palette.gray500,
    border: palette.gray300,
    accent: palette.blue400,
    caffeineAccent: palette.blue400,
    danger: palette.red400,
    dangerSubtle: '#7f1d1d',
    success: '#4ade80',
    warning: palette.yellow400,
    alertBanner: palette.red600,
    onAlertBanner: palette.white,
    onAlertBannerSubtle: '#fca5a5',
    cardBackground: palette.surface_dark,
  },
} as const;

export function useThemeColors() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? colors.dark : colors.light;
}

// ---------------------------------------------------------------------------
// Spacing — 4pt base grid
// xs:4  sm:8  md:12  lg:16  xl:20  xxl:24
// ---------------------------------------------------------------------------
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

// ---------------------------------------------------------------------------
// Border radius
// ---------------------------------------------------------------------------
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------
export const typography = {
  displayLarge:  { fontSize: 48, fontWeight: '700' as const, lineHeight: 56 },
  displayMedium: { fontSize: 36, fontWeight: '700' as const, lineHeight: 44 },
  headingLarge:  { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  headingMedium: { fontSize: 17, fontWeight: '600' as const, lineHeight: 24 },
  headingSmall:  { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
  bodyLarge:     { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium:    { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySmall:     { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  caption:       { fontSize: 11, fontWeight: '600' as const, lineHeight: 16, textTransform: 'uppercase' as const },
  label:         { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
} as const;
