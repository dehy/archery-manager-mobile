import type { components } from './schema';

/** Payload types come from the pinned contract (api/openapi.yaml): run `npm run api:sync` to refresh. */
type Schemas = components['schemas'];

export type TokenResponse = Schemas['TokenPair'];
export type MeResponse = Schemas['Me'];
export type HomeResponse = Schemas['Home'];
export type ClubOverview = Schemas['ClubOverview'];
export type Club = Schemas['Club'];
export type MemberPage = Schemas['MemberPage'];
export type MemberSummary = Schemas['MemberSummary'];
/** A directory row: a member plus whether the viewer may open their profile. */
export type DirectoryMember = MemberPage['data'][number];
export type LicenseeProfile = Schemas['LicenseeProfile'];
export type Attachment = Schemas['Attachment'];
export type EnumValue = Schemas['EnumValue'];
export type Group = Schemas['Group'];

export type EventListResponse = Schemas['EventList'];
export type EventSummary = Schemas['EventSummary'];
export type EventListItem = Schemas['EventListItem'];
export type EventDetail = Schemas['EventDetail'];
export type EventResponse = Schemas['EventResponse'];
export type EventAttachment = Schemas['EventAttachment'];
export type EventParticipant = Schemas['EventParticipant'];
export type EventParticipantList = Schemas['EventParticipantList'];
export type ParticipationAnswer = Schemas['EventParticipationAnswer'];
export type ParticipationOptions = Schemas['ParticipationOptions'];
export type ParticipationRequest = Schemas['ParticipationRequest'];
export type ResultHistory = Schemas['ResultHistory'];
export type HistoryResult = Schemas['HistoryResult'];
export type ContestResults = Schemas['ContestResults'];
export type ContestResult = Schemas['ContestResult'];
export type PracticeAdviceList = Schemas['PracticeAdviceList'];
export type PracticeAdviceSummary = Schemas['PracticeAdviceSummary'];
export type PracticeAdviceResponse = Schemas['PracticeAdviceResponse'];
export type PracticeAdviceDetail = Schemas['PracticeAdviceDetail'];
export type CalendarSubscriptionResponse = Schemas['CalendarSubscriptionResponse'];

/** What the app keeps for a session. Not an API payload. */
export type Tokens = {
  accessToken: string;
  /** Epoch milliseconds, computed from `expires_in`: tokens are opaque, never decode them. */
  accessTokenExpiresAt: number;
  refreshToken: string;
};
