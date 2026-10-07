/** Hand-written for now; replace with generated types once the backend publishes an OpenAPI spec. */

export type TokenResponse = {
  token_type: 'Bearer';
  access_token: string;
  /** Seconds until the access token expires. */
  expires_in: number;
  refresh_token: string;
};

export type Tokens = {
  accessToken: string;
  /** Epoch milliseconds. */
  accessTokenExpiresAt: number;
  refreshToken: string;
};

export type MeResponse = {
  user: { id: number; email: string; firstname: string | null; lastname: string | null };
  licensees: { ffta_member_code: string; firstname: string | null; lastname: string | null }[];
  context: { licensee: string | null; season: number | null };
};
