import { SymbolView } from 'expo-symbols';
import { View, type ColorValue } from 'react-native';

import { isIOS, useTheme } from './theme';

/** The app's icons: an SF Symbol on iOS, its Material Symbol counterpart on Android. */
const ICONS = {
  calendar: { ios: 'calendar', android: 'calendar_today' },
  calendarAdd: { ios: 'calendar.badge.plus', android: 'calendar_add_on' },
  clock: { ios: 'clock', android: 'schedule' },
  people: { ios: 'person.2', android: 'group' },
  place: { ios: 'mappin.and.ellipse', android: 'location_on' },
  share: { ios: 'square.and.arrow.up', android: 'share' },
  tag: { ios: 'tag', android: 'sell' },
  target: { ios: 'scope', android: 'adjust' },
  person: { ios: 'person', android: 'person' },
  club: { ios: 'flag', android: 'flag' },
  groups: { ios: 'person.3', android: 'groups' },
  document: { ios: 'doc.text', android: 'description' },
} as const;

export type IconName = keyof typeof ICONS;

/** Decorative by default: hidden from screen readers, the text next to it says the same. */
export function Icon({
  name,
  size = 17,
  color,
}: {
  name: IconName;
  size?: number;
  color?: ColorValue;
}) {
  const theme = useTheme();
  return (
    <SymbolView
      name={{ ...ICONS[name], web: ICONS[name].android }}
      size={size}
      tintColor={color ?? theme.muted}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}

/** Leading icon of a list row: a tinted tile on iOS (as in Settings), a plain icon on Android. */
export function RowIcon({ name }: { name: IconName }) {
  const theme = useTheme();
  if (!isIOS) return <Icon name={name} size={24} />;
  return (
    <View
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.primaryContainer,
      }}
    >
      <Icon name={name} size={16} color={theme.onPrimaryContainer} />
    </View>
  );
}
