import { t } from '@/i18n';
import type { components } from '@/api/schema';

type Schemas = components['schemas'];

export type EventType = Schemas['EventSummary']['type'];
export type ParticipationState = NonNullable<Schemas['EventSummary']['participation_state']>;
export type ApplicationStatus = Schemas['ClubApplication']['status'];

const CONTEST_TYPES: EventType[] = ['contest_official', 'contest_hobby'];

export const eventTypeLabel = (type: EventType) => t(`labels.eventType.${type}`);

export const applicationStatusLabel = (status: ApplicationStatus) =>
  t(`labels.applicationStatus.${status}`);

/** Wording differs for contests and trainings; `null` means "no answer yet". */
export function participationLabel(type: EventType, state: ParticipationState | null): string {
  if (!state) return t('labels.participation.none');
  const kind = CONTEST_TYPES.includes(type) ? 'contest' : 'training';
  return t(`labels.participation.${kind}.${state}`);
}

/** Short wording for an event row's status pill ("Inscrit", "Présent", "Pas de réponse"…). */
export function participationShortLabel(type: EventType, state: ParticipationState | null): string {
  if (!state) return t('labels.participationShort.none');
  if (state !== 'registered') return t(`labels.participationShort.${state}`);
  const kind = CONTEST_TYPES.includes(type) ? 'contest' : 'training';
  return t(`labels.participationShort.registered.${kind}`);
}
