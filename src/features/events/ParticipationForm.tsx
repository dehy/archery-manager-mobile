import { useState } from 'react';
import { View } from 'react-native';

import { ApiError } from '@/api/errors';
import type { EventDetail, EnumValue } from '@/api/types';
import { participationLabel } from '@/features/labels';
import { t } from '@/i18n';
import { Button, Text, spacing } from '@/ui';
import { PickerRow, Segmented } from '@/ui/controls';

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

  // The details of an answer only matter once registered: the arm, and the target face and
  // session of a contest. Each is a native pull-down menu.
  const details = draft.state === 'registered';
  type Field = {
    key: string;
    label: string;
    options: { value: string | number; label: string }[];
    value: string | number | null;
    onChange: (value: string | number) => void;
  };
  const fields: Field[] = [];
  if (options.activities.length > 1) {
    fields.push({
      key: 'activity',
      label: t('events.activity'),
      options: enumOptions(options.activities),
      value: draft.activity,
      onChange: (v) => update({ activity: String(v) }),
    });
  }
  if (contest && options.target_types?.length) {
    fields.push({
      key: 'target',
      label: t('events.targetType'),
      options: enumOptions(options.target_types),
      value: draft.targetType,
      onChange: (v) => update({ targetType: String(v) }),
    });
  }
  if (contest && options.departures?.length) {
    fields.push({
      key: 'departure',
      label: t('events.departure'),
      options: options.departures.map((d) => ({
        value: d,
        label: t('events.departureN', { n: d }),
      })),
      value: draft.departure,
      onChange: (v) => update({ departure: Number(v) }),
    });
  }

  return (
    <View style={{ paddingVertical: spacing.md, gap: spacing.md }}>
      {!event.can_participate ? (
        <Text variant="muted" style={{ paddingHorizontal: 16 }}>
          {t('events.restrictedBody')}
        </Text>
      ) : null}

      <View style={{ paddingHorizontal: 16 }}>
        <Segmented
          testID="answer-state"
          options={options.states.map((s) => ({
            value: s,
            label: participationLabel(event.type, s),
          }))}
          value={draft.state}
          onChange={(state) => update({ state })}
          enabled={!disabled}
        />
      </View>

      {details && fields.length ? (
        <View>
          {fields.map((f, i) => (
            <PickerRow
              key={f.key}
              testID={`answer-${f.key}`}
              label={f.label}
              options={f.options}
              value={f.value}
              onChange={f.onChange}
              enabled={!disabled}
              last={i === fields.length - 1}
            />
          ))}
        </View>
      ) : null}

      <View style={{ paddingHorizontal: 16, gap: spacing.sm }}>
        {mutation.error ? <Text variant="error">{answerErrorMessage(mutation.error)}</Text> : null}
        <Button
          title={t('events.save')}
          onPress={submit}
          loading={mutation.isPending}
          disabled={!canSave(draft, event)}
        />
        {saved && !mutation.error ? (
          <Text variant="muted" style={{ textAlign: 'center' }}>
            {t('events.saved')}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
