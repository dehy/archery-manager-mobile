import {
  contrastRatio,
  fitContrast,
  iosAccent,
  materialColors,
  normalizeHex,
  onColor,
} from '../clubColor';

describe('normalizeHex', () => {
  it('accepts the usual spellings of a hex color', () => {
    expect(normalizeHex('#0A7D33')).toBe('#0a7d33');
    expect(normalizeHex(' 0a7d33 ')).toBe('#0a7d33');
    expect(normalizeHex('#fc0')).toBe('#ffcc00');
  });

  it('reads anything else as no color', () => {
    expect(normalizeHex(null)).toBeNull();
    expect(normalizeHex('')).toBeNull();
    expect(normalizeHex('green')).toBeNull();
    expect(normalizeHex('#12345')).toBeNull();
  });
});

describe('fitContrast', () => {
  it('keeps a color that is already readable', () => {
    expect(fitContrast('#0a7d33', '#ffffff', 4.5)).toBe('#0a7d33');
  });

  it('darkens a pale color on white and lightens a dark one on black', () => {
    const yellow = fitContrast('#f5c400', '#ffffff', 4.5);
    expect(contrastRatio(yellow, '#ffffff')).toBeGreaterThanOrEqual(4.5);
    const navy = fitContrast('#1e3a8a', '#1c1c1e', 4.5);
    expect(contrastRatio(navy, '#1c1c1e')).toBeGreaterThanOrEqual(4.5);
  });
});

describe('iosAccent', () => {
  it('meets 4.5:1 on cells and 7:1 with Increase Contrast', () => {
    const accent = iosAccent('#f5c400');
    expect(contrastRatio(accent.light, '#ffffff')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(accent.dark, '#1c1c1e')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(accent.highContrastLight, '#ffffff')).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(accent.highContrastDark, '#1c1c1e')).toBeGreaterThanOrEqual(7);
  });
});

describe('materialColors', () => {
  it.each([false, true])('builds a readable scheme (dark: %s)', (dark) => {
    const colors = materialColors('#f5c400', dark);
    for (const value of Object.values(colors)) expect(value).toMatch(/^#[0-9a-f]{6}$/);
    expect(contrastRatio(colors.text, colors.background)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(colors.primary, colors.background)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(colors.onPrimary, colors.primary)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('onColor', () => {
  it('writes white on dark fills and near-black on light ones', () => {
    expect(onColor('#1e3a8a')).toBe('#ffffff');
    expect(onColor('#f5c400')).toBe('#1c1b1f');
  });
});
