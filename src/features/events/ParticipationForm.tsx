import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { ApiError } from '@/api/errors';
import type { EventDetail, EnumValue } from '@/api/types';
import { participationLabel } from '@/features/labels';
import { t } from '@/i18n';
import { Button, Chip, Text, spacing } from '@/ui';

import { useAnswerEvent } from './queries';
import { buildAnswer, canSave, initialDraft, isContest, type Draft } from './participation';

export function answerErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'event_restricted') return t('events.errors.restricted');
    if (error.code === 'validation_failed') return t('events.errors.invalid');
    if (error.code === 'network_error') return t('common.offline');
  }
  return t('events.errors.generic');
}

function ChipGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text variant="muted">{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {options.map((o) => (
          <Chip
            key={String(o.value)}
            label={o.label}
            selected={value === o.value}
            onPress={disabled ? undefined : () => onChange(o.value)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const enumOptions = (values: EnumValue[]) => values.map((v) => ({ value: v.code, label: v.label }));

export function ParticipationForm({ event }: { event: EventDetail }) {
  const options = event.participation_options;
  const contest = isContest(options);
  const [draft, setDraft] = useState<Draft>(() => initialDraft(event));
  const [saved, setSaved] = useState(false);
  const mutation = useAnswerEvent(event.id);
  const disabled = !event.can_participate || mutation.isPending;

  // Follow the server: when the stored answer changes (refetch, saved answer) the draft restarts
  // from it. Adjusting state while rendering is React's pattern for this, not an effect.
  const [serverAnswer, setServerAnswer] = useState(event.my_participation);
  if (serverAnswer !== event.my_participation) {
    setServerAnswer(event.my_participation);
    setDraft(initialDraft(event));
  }

  const update = (patch: Partial<Draft>) => {
    setSaved(false);
    setDraft((d) => ({ ...d, ...patch }));
  };

  const submit = () => {
    const answer = buildAnswer(draft, options);
    if (answer) mutation.mutate(answer, { onSuccess: () => setSaved(true) });
  };

  return (
    <View style={{ gap: spacing.md, paddingHorizontal: 16, paddingVertical: spacing.md }}>
      {!event.can_participate ? <Text variant="muted">{t('events.restrictedBody')}</Text> : null}

      <ChipGroup
        label={t('events.answer')}
        options={options.states.map((s) => ({
          value: s,
          label: participationLabel(event.type, s),
        }))}
        value={draft.state}
        onChange={(state) => update({ state })}
        disabled={disabled}
      />
      {options.activities.length > 1 ? (
        <ChipGroup
          label={t('events.activity')}
          options={enumOptions(options.activities)}
          value={draft.activity}
          onChange={(activity) => update({ activity })}
          disabled={disabled}
        />
      ) : null}
      {contest && options.target_types?.length ? (
        <ChipGroup
          label={t('events.targetType')}
          options={enumOptions(options.target_types)}
          value={draft.targetType}
          onChange={(targetType) => update({ targetType })}
          disabled={disabled}
        />
      ) : null}
      {contest && options.departures?.length ? (
        <ChipGroup
          label={t('events.departure')}
          options={options.departures.map((d) => ({
            value: d,
            label: t('events.departureN', { n: d }),
          }))}
          value={draft.departure}
          onChange={(departure) => update({ departure })}
          disabled={disabled}
        />
      ) : null}

      {mutation.error ? <Text variant="error">{answerErrorMessage(mutation.error)}</Text> : null}
      {saved && !mutation.error ? <Text variant="muted">{t('events.saved')}</Text> : null}
      <Button
        title={t('events.save')}
        onPress={submit}
        loading={mutation.isPending}
        disabled={!canSave(draft, event)}
      />
    </View>
  );
}
