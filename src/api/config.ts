import { Platform } from 'react-native';

const DEFAULT_API_URL = 'http://localhost:8080';

/** Base URL of the backend, without trailing slash. Set EXPO_PUBLIC_API_URL to override. */
export function getApiUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;
  // The Android emulator reaches the host machine through 10.0.2.2, not localhost.
  const resolved =
    Platform.OS === 'android' ? url.replace(/\/\/(localhost|127\.0\.0\.1)/, '//10.0.2.2') : url;
  return resolved.replace(/\/+$/, '');
}
