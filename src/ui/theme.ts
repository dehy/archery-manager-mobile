import { useColorScheme } from 'react-native';

const light = {
  background: '#ffffff',
  surface: '#f3f4f6',
  text: '#111827',
  muted: '#6b7280',
  primary: '#0f766e',
  onPrimary: '#ffffff',
  danger: '#b91c1c',
  border: '#d1d5db',
};

const dark: typeof light = {
  background: '#0b0f14',
  surface: '#161b22',
  text: '#f3f4f6',
  muted: '#9ca3af',
  primary: '#2dd4bf',
  onPrimary: '#042f2e',
  danger: '#f87171',
  border: '#30363d',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24 } as const;

export function useTheme() {
  return useColorScheme() === 'dark' ? dark : light;
}
