import { isIOS, useTheme } from '../theme';

// Single import point for Expo Router's native navigation APIs. NativeTabs still lives under an
// "unstable" path in SDK 57: if it moves, only this file changes.
export { NativeTabs } from 'expo-router/unstable-native-tabs';

/**
 * Header colors for a native stack, spread into `screenOptions`. iOS: bar buttons take the club
 * tint, titles stay `label`. Android: the bar sits on the scheme's surface, like a Material top app bar.
 */
export function useStackColors() {
  const theme = useTheme();
  if (isIOS) {
    return {
      headerTintColor: theme.primary as string,
      headerTitleStyle: { color: theme.text as string },
      headerLargeTitleStyle: { color: theme.text as string },
    };
  }
  return {
    headerTintColor: theme.text as string,
    headerStyle: { backgroundColor: theme.background as string },
    contentStyle: { backgroundColor: theme.background },
  };
}

/** NativeTabs colors: the club tint on iOS, the Material navigation bar roles on Android. */
export function useTabBarColors() {
  const theme = useTheme();
  if (isIOS) return { tintColor: theme.primary };
  return {
    tintColor: theme.primary,
    backgroundColor: theme.surface,
    indicatorColor: theme.primaryContainer,
    iconColor: { default: theme.muted, selected: theme.onPrimaryContainer },
    labelStyle: { default: { color: theme.muted }, selected: { color: theme.text } },
  };
}
