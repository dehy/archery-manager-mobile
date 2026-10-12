import { Host, Picker } from '@expo/ui';
import { SegmentedControl } from '@expo/ui/community/segmented-control';
import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n';

import { Text } from './primitives';
import { isIOS, useTheme } from './theme';

/**
 * One choice among a few, as a native control: UISegmentedControl on iOS (system look, the tint
 * does not apply), Material segmented buttons on Android (selected segment in the club tint).
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  enabled = true,
  testID,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  enabled?: boolean;
  testID?: string;
}) {
  const theme = useTheme();
  const index = options.findIndex((o) => o.value === value);
  return (
    <SegmentedControl
      testID={testID}
      values={options.map((o) => o.label)}
      selectedIndex={index}
      enabled={enabled}
      tintColor={isIOS ? undefined : (theme.primaryContainer as string)}
      onChange={(event) => onChange(options[event.nativeEvent.selectedSegmentIndex].value)}
    />
  );
}

const NONE = '__none__';

/**
 * A labelled row whose value opens a native menu (SwiftUI pull-down on iOS, Material dropdown on
 * Android). Sits inside a `Section` like a `Row`.
 */
export function PickerRow<T extends string | number>({
  label,
  options,
  value,
  onChange,
  enabled = true,
  last,
  testID,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  enabled?: boolean;
  last?: boolean;
  testID?: string;
}) {
  const theme = useTheme();
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingLeft: 16,
          paddingRight: isIOS ? 8 : 16,
          minHeight: isIOS ? 44 : 56,
        }}
      >
        <Text style={{ flex: 1 }}>{label}</Text>
        <Host matchContents>
          {/* The menu always shows a selection: an unanswered field shows "Choisir". */}
          <Picker
            testID={testID}
            selectedValue={value ?? (NONE as T)}
            onValueChange={(v: T) => {
              if (v !== NONE) onChange(v);
            }}
            enabled={enabled}
          >
            {value === null ? <Picker.Item label={t('common.choose')} value={NONE as T} /> : null}
            {options.map((o) => (
              <Picker.Item key={String(o.value)} label={o.label} value={o.value} />
            ))}
          </Picker>
        </Host>
      </View>
      {isIOS && !last ? (
        <View
          style={{
            height: StyleSheet.hairlineWidth,
            backgroundColor: theme.border,
            marginLeft: 16,
          }}
        />
      ) : null}
    </View>
  );
}
