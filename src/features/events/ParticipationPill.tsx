import { StyleSheet, View } from 'react-native';

import {
  participationShortLabel,
  type EventType,
  type ParticipationState,
} from '@/features/labels';
import { Text, isIOS, useTheme } from '@/ui';

/**
 * The member's answer at a glance: filled when registered, outlined in the tint when interested,
 * a thin neutral outline when there is no answer yet, a neutral fill when not going.
 */
export function ParticipationPill({
  type,
  state,
}: {
  type: EventType;
  state: ParticipationState | null;
}) {
  const theme = useTheme();
  const look = {
    registered: {
      backgroundColor: theme.primary,
      color: theme.onPrimary,
      borderColor: theme.primary,
    },
    interested: {
      backgroundColor: 'transparent',
      color: theme.primary,
      borderColor: theme.primary,
    },
    not_going: { backgroundColor: theme.tint, color: theme.muted, borderColor: 'transparent' },
    none: { backgroundColor: 'transparent', color: theme.muted, borderColor: theme.muted },
  }[state ?? 'none'];

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        height: 22,
        justifyContent: 'center',
        paddingHorizontal: 8,
        borderRadius: isIOS ? 11 : 8,
        borderWidth: state ? 1 : StyleSheet.hairlineWidth * 2,
        backgroundColor: look.backgroundColor,
        borderColor: look.borderColor,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: '600', color: look.color }}>
        {participationShortLabel(type, state)}
      </Text>
    </View>
  );
}
