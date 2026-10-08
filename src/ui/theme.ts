import { PlatformColor, useColorScheme, type ColorValue } from 'react-native';

export type Theme = {
  /** Screen background (grouped background on iOS). */
  background: ColorValue;
  /** Cards and list groups sitting on the background. */
  surface: ColorValue;
  text: ColorValue;
  muted: ColorValue;
  primary: ColorValue;
  onPrimary: ColorValue;
  danger: ColorValue;
  border: ColorValue;
  /** Tinted fill for chips and avatars. */
  tint: ColorValue;
};

const android = {
  light: {
    background: '#fdfbff',
    surface: '#f1ecf4',
    text: '#1c1b1f',
    muted: '#605d66',
    primary: '#0f766e',
    onPrimary: '#ffffff',
    danger: '#b3261e',
    border: '#cac4d0',
    tint: '#d8efec',
  },
  dark: {
    background: '#141218',
    surface: '#211f26',
    text: '#e6e0e9',
    muted: '#aaa6b0',
    primary: '#2dd4bf',
    onPrimary: '#042f2e',
    danger: '#f2b8b5',
    border: '#49454f',
    tint: '#17423e',
  },
} satisfies Record<'light' | 'dark', Theme>;

// iOS follows the system palette (adapts to dark mode and accessibility settings by itself).
const ios: Theme = {
  background: PlatformColor('systemGroupedBackground'),
  surface: PlatformColor('secondarySystemGroupedBackground'),
  text: PlatformColor('label'),
  muted: PlatformColor('secondaryLabel'),
  primary: PlatformColor('systemTeal'),
  onPrimary: '#ffffff',
  danger: PlatformColor('systemRed'),
  border: PlatformColor('separator'),
  tint: PlatformColor('tertiarySystemFill'),
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24 } as const;

export const isIOS = process.env.EXPO_OS === 'ios';

export function useTheme(): Theme {
  const scheme = useColorScheme();
  if (isIOS) return ios;
  return scheme === 'dark' ? android.dark : android.light;
}
