import type { components } from './schema';

/** Payload types come from the pinned contract (api/openapi.yaml): run `npm run api:sync` to refresh. */
type Schemas = components['schemas'];

export type TokenResponse = Schemas['TokenPair'];
export type MeResponse = Schemas['Me'];
export type HomeResponse = Schemas['Home'];
export type ClubOverview = Schemas['ClubOverview'];
export type MemberPage = Schemas['MemberPage'];
export type MemberSummary = Schemas['MemberSummary'];
export type LicenseeProfile = Schemas['LicenseeProfile'];
export type Attachment = Schemas['Attachment'];
export type EnumValue = Schemas['EnumValue'];
export type Group = Schemas['Group'];

/** What the app keeps for a session. Not an API payload. */
export type Tokens = {
  accessToken: string;
  /** Epoch milliseconds, computed from `expires_in`: tokens are opaque, never decode them. */
  accessTokenExpiresAt: number;
  refreshToken: string;
};
