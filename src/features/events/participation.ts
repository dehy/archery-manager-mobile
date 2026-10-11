import type {
  EventDetail,
  ParticipationAnswer,
  ParticipationOptions,
  ParticipationRequest,
} from '@/api/types';

export type State = NonNullable<ParticipationAnswer['participation_state']>;

export type Draft = {
  state: State | null;
  activity: string | null;
  targetType: string | null;
  departure: number | null;
};

/** Contests are the events that take a target type and a departure. */
export const isContest = (options: ParticipationOptions) => options.target_types !== null;

/** The form starts from the member's current answer (or the defaults the server computed). */
export function initialDraft(event: EventDetail): Draft {
  const { my_participation: mine, participation_options: options } = event;
  return {
    state: mine.participation_state,
    activity: mine.activity?.code ?? options.activities[0]?.code ?? null,
    targetType: mine.target_type?.code ?? null,
    departure: mine.departure ?? null,
  };
}

/** The whole answer, as the API wants it: contest-only fields are never sent for other events. */
export function buildAnswer(
  draft: Draft,
  options: ParticipationOptions,
): ParticipationRequest | null {
  if (!draft.state) return null;
  const answer: ParticipationRequest = { participation_state: draft.state };
  if (draft.activity) answer.activity = draft.activity;
  if (isContest(options)) {
    answer.target_type = draft.targetType;
    answer.departure = draft.departure;
  }
  return answer;
}

/** Whether saving would change something (an unrecorded default is worth recording). */
export function canSave(draft: Draft, event: EventDetail): boolean {
  if (!event.can_participate || !draft.state) return false;
  const saved = initialDraft(event);
  const same =
    draft.state === saved.state &&
    draft.activity === saved.activity &&
    draft.targetType === saved.targetType &&
    draft.departure === saved.departure;
  return !same || event.my_participation.is_default;
}
