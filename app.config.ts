import type { ExpoConfig } from 'expo/config';

// Temporary codename: rename name / slug / scheme / identifiers here only.
const config: ExpoConfig = {
  name: 'Quiver',
  slug: 'quiver',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'quiver',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'net.admds.quiver',
  },
  android: {
    package: 'net.admds.quiver',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: { favicon: './assets/favicon.png' },
  plugins: ['expo-router', 'expo-secure-store', 'expo-localization'],
  experiments: { typedRoutes: true },
};

export default config;
