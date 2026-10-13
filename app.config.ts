import type { ExpoConfig } from 'expo/config';

// App identity: name / slug / scheme / identifiers live here only. The bundle ID and package
// (reverse of karkwa.fr) can never change once the app is published on a store.
const config: ExpoConfig = {
  name: 'Karkwa',
  slug: 'karkwa',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'karkwa',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    // Light / dark / tinted home-screen variants (iOS 18+); overrides the top-level `icon`.
    icon: {
      light: './assets/icon.png',
      dark: './assets/ios-icon-dark.png',
      tinted: './assets/ios-icon-tinted.png',
    },
    bundleIdentifier: 'fr.karkwa.app',
    // Signing team (Arnaud DE MOUHY, individual membership). Not a secret: it is in every signed build.
    appleTeamId: 'E9GCQH28SQ',
    infoPlist: {
      // Shown by iOS the first time the app reaches a server on the local network (dev backends).
      NSLocalNetworkUsageDescription:
        'Karkwa se connecte au serveur de votre club sur le réseau local pendant le développement.',
      // French first: system-provided UI (back button, VoiceOver hints) follows the device language
      // instead of falling back to English.
      CFBundleDevelopmentRegion: 'fr',
      CFBundleAllowMixedLocalizations: true,
    },
  },
  android: {
    package: 'fr.karkwa.app',
    adaptiveIcon: {
      backgroundColor: '#FBF3E4',
      foregroundImage: './assets/android-icon-foreground.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: { favicon: './assets/favicon.png' },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-localization',
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 160,
        backgroundColor: '#FBF3E4',
        dark: { image: './assets/splash-icon-dark.png', backgroundColor: '#3A2610' },
      },
    ],
    // "Ajouter au calendrier" only opens the system form: write-only access is enough (iOS 17+).
    [
      'expo-calendar',
      {
        writeOnlyAccess: true,
        writeOnlyCalendarPermission: 'Karkwa ajoute les événements du club à votre calendrier.',
      },
    ],
    // Xcode 27 / iOS 27 SDK refuses to launch apps without the UIScene life cycle. Opt-in on
    // SDK 57 (needs expo >= 57.0.23); SDK 58 enables it by default, then remove this entry.
    ['expo-build-properties', { ios: { enableSceneSupport: true } }],
    // Uploads source maps and debug symbols on release builds (needs SENTRY_AUTH_TOKEN).
    [
      '@sentry/react-native/expo',
      { url: 'https://sentry.io/', project: 'karkwa', organization: 'flying-pingu' },
    ],
  ],
  experiments: { typedRoutes: false },
};

export default config;
