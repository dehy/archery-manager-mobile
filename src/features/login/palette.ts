import { useColorScheme } from 'react-native';

/**
 * Karkwa's own colors, for the signed-out screens: no club is known yet, so they never take a
 * club tint. Same cream and brown as the splash screen, so launch flows into login.
 */
const PALETTE = {
  light: {
    background: '#FBF3E4',
    surface: '#FFFFFF',
    text: '#2A1B0A',
    muted: '#6F5430',
    border: '#8A7660',
    focus: '#5B3C11',
    separator: 'rgba(91, 60, 17, 0.18)',
    link: '#5B3C11',
    errorBackground: '#FDE3D8',
    errorText: '#A3300A',
  },
  dark: {
    background: '#3A2610',
    surface: 'rgba(251, 243, 228, 0.08)',
    text: '#FBF3E4',
    muted: '#D8C3A1',
    border: '#A08A6C',
    focus: '#FBF3E4',
    separator: 'rgba(251, 243, 228, 0.16)',
    link: '#FBF3E4',
    errorBackground: 'rgba(255, 79, 25, 0.18)',
    errorText: '#FFB49A',
  },
} as const;

/** The brand orange of the button; the dark brown on it keeps 4.5:1 (white would not). */
export const BUTTON = { background: '#FF4F19', text: '#3A2610' } as const;

export type LoginPalette = (typeof PALETTE)[keyof typeof PALETTE];

export function useLoginPalette(): { palette: LoginPalette; dark: boolean } {
  const dark = useColorScheme() === 'dark';
  return { palette: dark ? PALETTE.dark : PALETTE.light, dark };
}
