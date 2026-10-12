import { Hct, SchemeFidelity, hexFromArgb, argbFromHex } from '@material/material-color-utilities';

/** `#rrggbb` (lowercase) from the API's free-form club color, or null when it is not a color. */
export function normalizeHex(value: string | null | undefined): string | null {
  const match = value?.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return null;
  const hex = match[1].toLowerCase();
  return `#${hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex}`;
}

function channels(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two `#rrggbb` colors (1 to 21). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * The color with its HCT tone moved away from the background until the contrast reaches `min`:
 * darker on a light background, lighter on a dark one. Hue and chroma are kept (as far as the
 * gamut allows), so the club stays recognizable.
 */
export function fitContrast(hex: string, background: string, min: number): string {
  if (contrastRatio(hex, background) >= min) return hex;
  const hct = Hct.fromInt(argbFromHex(hex));
  const step = luminance(background) < 0.2 ? 1 : -1;
  let out = hex;
  for (let tone = hct.tone; tone >= 0 && tone <= 100; tone += step) {
    out = hexFromArgb(Hct.from(hct.hue, hct.chroma, tone).toInt());
    if (contrastRatio(out, background) >= min) break;
  }
  return out;
}

/** Text or icon color readable on a fill of the club color (the club's own logo badge). */
export function onColor(hex: string): string {
  return contrastRatio(hex, '#ffffff') >= 3 ? '#ffffff' : '#1c1b1f';
}

export function withAlpha(hex: string, alpha: number): string {
  return `rgba(${channels(hex).join(', ')}, ${alpha})`;
}

// iOS surfaces the tint sits on: grouped cells in light and dark mode.
const IOS_SURFACE = { light: '#ffffff', dark: '#1c1c1e' };

/** The iOS tint for each appearance; 4.5:1 on cells, 7:1 when "Increase Contrast" is on. */
export function iosAccent(hex: string) {
  return {
    light: fitContrast(hex, IOS_SURFACE.light, 4.5),
    dark: fitContrast(hex, IOS_SURFACE.dark, 4.5),
    highContrastLight: fitContrast(hex, IOS_SURFACE.light, 7),
    highContrastDark: fitContrast(hex, IOS_SURFACE.dark, 7),
  };
}

export type MaterialColors = {
  background: string;
  surface: string;
  text: string;
  muted: string;
  primary: string;
  onPrimary: string;
  danger: string;
  border: string;
  tint: string;
  primaryContainer: string;
  onPrimaryContainer: string;
};

const materialCache = new Map<string, MaterialColors>();

/**
 * A Material 3 scheme seeded with the club color. The fidelity variant keeps the seed's chroma
 * (a tonal spot scheme would wash most club colors out to pastels).
 */
export function materialColors(hex: string, dark: boolean): MaterialColors {
  const key = `${hex}:${dark}`;
  const cached = materialCache.get(key);
  if (cached) return cached;
  const s = new SchemeFidelity(Hct.fromInt(argbFromHex(hex)), dark, 0);
  const colors: MaterialColors = {
    background: hexFromArgb(s.surface),
    surface: hexFromArgb(s.surfaceContainer),
    text: hexFromArgb(s.onSurface),
    muted: hexFromArgb(s.onSurfaceVariant),
    primary: hexFromArgb(s.primary),
    onPrimary: hexFromArgb(s.onPrimary),
    danger: hexFromArgb(s.error),
    border: hexFromArgb(s.outlineVariant),
    tint: hexFromArgb(s.secondaryContainer),
    primaryContainer: hexFromArgb(s.secondaryContainer),
    onPrimaryContainer: hexFromArgb(s.onSecondaryContainer),
  };
  materialCache.set(key, colors);
  return colors;
}
