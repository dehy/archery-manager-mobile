import { View } from 'react-native';

import { Text } from './primitives';
import { spacing, useTheme } from './theme';

export type Bar = { key: string | number; value: number; label: string };

const HEIGHT = 120;
const MIN_BAR = 8;

/**
 * Small vertical bar chart drawn with Views (no native chart module). The scale starts a little
 * under the lowest value so that progress between close scores stays visible; the latest bar is
 * emphasized. Screen readers get one sentence instead of the bars.
 */
export function BarChart({ bars, summary }: { bars: Bar[]; summary: string }) {
  const theme = useTheme();
  if (bars.length === 0) return null;

  const values = bars.map((b) => b.value);
  const high = Math.max(...values);
  const low = Math.floor(Math.min(...values) * 0.95);
  const range = high - low || 1;
  const showValues = bars.length <= 8;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={summary}
      style={{ gap: spacing.xs }}
    >
      <View style={{ height: HEIGHT + 18, flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
        {bars.map((b, i) => {
          const latest = i === bars.length - 1;
          return (
            <View key={b.key} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
              {showValues ? (
                <Text
                  variant="muted"
                  style={{ fontSize: 11, fontVariant: ['tabular-nums'] }}
                  numberOfLines={1}
                >
                  {b.value}
                </Text>
              ) : null}
              <View
                style={{
                  width: '100%',
                  maxWidth: 28,
                  height: MIN_BAR + ((b.value - low) / range) * (HEIGHT - MIN_BAR),
                  borderRadius: 4,
                  backgroundColor: latest ? theme.primary : theme.tint,
                }}
              />
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="muted" style={{ fontSize: 11 }}>
          {bars[0].label}
        </Text>
        {bars.length > 1 ? (
          <Text variant="muted" style={{ fontSize: 11 }}>
            {bars[bars.length - 1].label}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
