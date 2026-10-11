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
    infoPlist: {
      // French first: system-provided UI (back button, VoiceOver hints) follows the device language
      // instead of falling back to English.
      CFBundleDevelopmentRegion: 'fr',
      CFBundleAllowMixedLocalizations: true,
    },
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
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-localization',
    // Xcode 27 / iOS 27 SDK refuses to launch apps without the UIScene life cycle. Opt-in on
    // SDK 57 (needs expo >= 57.0.23); SDK 58 enables it by default, then remove this entry.
    ['expo-build-properties', { ios: { enableSceneSupport: true } }],
  ],
  experiments: { typedRoutes: false },
};

export default config;
