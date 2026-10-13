import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';

import type { EventParticipant } from '@/api/types';
import { loadErrorMessage } from '@/features/errors';
import { useEvent, useParticipants } from '@/features/events/queries';
import { participationLabel } from '@/features/labels';
import { t } from '@/i18n';
import { Message, Row, ScrollScreen, Section, SkeletonRows, usePullToRefresh } from '@/ui';

const ORDER = ['registered', 'interested', 'not_going'] as const;

export default function ParticipantsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = useEvent(Number(id));
  const { data, error, isPending, refetch } = useParticipants(Number(id));
  const pull = usePullToRefresh(refetch);

  const groups = useMemo(() => {
    const byState = new Map<string, EventParticipant[]>();
    for (const p of data ?? []) {
      const key = p.participation_state ?? 'none';
      byState.set(key, [...(byState.get(key) ?? []), p]);
    }
    return [...ORDER, 'none']
      .filter((k) => byState.has(k))
      .map((k) => ({ key: k, items: byState.get(k)! }));
  }, [data]);

  const type = event.data?.type ?? 'other';

  return (
    <ScrollScreen refreshing={pull.refreshing} onRefresh={pull.onRefresh}>
      <Stack.Screen
        options={{ title: t('events.participants'), headerBackButtonDisplayMode: 'minimal' }}
      />
      {isPending && !error ? <SkeletonRows count={6} /> : null}
      {error ? (
        <Message
          title={loadErrorMessage(error)}
          actionLabel={t('common.retry')}
          onAction={refetch}
        />
      ) : null}
      {data && data.length === 0 ? <Message title={t('events.noParticipants')} /> : null}
      {groups.map((g) => (
        <Section
          key={g.key}
          title={`${g.key === 'none' ? t('labels.participation.none') : participationLabel(type, g.key as (typeof ORDER)[number])} · ${g.items.length}`}
        >
          {g.items.map((p, i) => (
            <Row
              key={p.licensee_id}
              testID={`participant-${p.licensee_id}`}
              title={p.display_name}
              subtitle={
                [
                  p.activity?.label,
                  p.target_type?.label,
                  p.departure != null ? t('events.departureN', { n: p.departure }) : null,
                  p.is_default ? t('events.byDefault') : null,
                ]
                  .filter(Boolean)
                  .join(' · ') || null
              }
              onPress={
                p.can_view_profile
                  ? () => router.push({ pathname: '/licensee/[id]', params: { id: p.licensee_id } })
                  : undefined
              }
              last={i === g.items.length - 1}
            />
          ))}
        </Section>
      ))}
    </ScrollScreen>
  );
}
