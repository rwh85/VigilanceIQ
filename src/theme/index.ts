import { useColorScheme } from 'react-native';

export const colors = {
  light: {
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#1a1a1a',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    accent: '#2563eb',
    danger: '#ef4444',
    success: '#22c55e',
    warning: '#eab308',
  },
  dark: {
    background: '#000000',
    surface: '#1c1c1e',
    text: '#ffffff',
    textSecondary: '#9ca3af',
    border: '#374151',
    accent: '#60a5fa',
    danger: '#f87171',
    success: '#4ade80',
    warning: '#facc15',
  },
} as const;

export function useThemeColors() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? colors.dark : colors.light;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;
