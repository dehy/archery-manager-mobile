import { useMemo } from 'react';
import { DynamicColorIOS, PlatformColor, useColorScheme, type ColorValue } from 'react-native';

import { useBrand } from './brand';
import { iosAccent, materialColors, withAlpha } from './clubColor';

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
  /** Fill carrying the club's identity (the club badge, the Android tab indicator). */
  primaryContainer: ColorValue;
  onPrimaryContainer: ColorValue;
};

/** Seed of the Android scheme when there is no club color (the app's own teal). */
const DEFAULT_SEED = '#0f766e';

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
  primaryContainer: PlatformColor('tertiarySystemFill'),
  onPrimaryContainer: PlatformColor('systemTeal'),
};

/** Only the tint follows the club on iOS: backgrounds, text and separators stay system colors. */
let iosTinted: { clubColor: string; theme: Theme } | null = null;

function iosTheme(clubColor: string | null): Theme {
  if (!clubColor) return ios;
  if (iosTinted?.clubColor !== clubColor) {
    iosTinted = { clubColor, theme: tintIos(clubColor) };
  }
  return iosTinted.theme;
}

function tintIos(clubColor: string): Theme {
  const accent = iosAccent(clubColor);
  const primary = DynamicColorIOS(accent);
  return {
    ...ios,
    primary,
    primaryContainer: DynamicColorIOS({
      light: withAlpha(accent.light, 0.12),
      dark: withAlpha(accent.dark, 0.24),
    }),
    onPrimaryContainer: primary,
  };
}

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24 } as const;

export const isIOS = process.env.EXPO_OS === 'ios';

export function useTheme(): Theme {
  const scheme = useColorScheme();
  const clubColor = useBrand((s) => s.clubColor);
  return useMemo(
    () =>
      isIOS ? iosTheme(clubColor) : materialColors(clubColor ?? DEFAULT_SEED, scheme === 'dark'),
    [clubColor, scheme],
  );
}
