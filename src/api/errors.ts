/** Stable machine-readable codes of the backend's `{ error, message }` body. */
export type ApiErrorCode =
  | 'invalid_credentials'
  | 'account_locked'
  | 'too_many_attempts'
  | 'invalid_refresh_token'
  | 'invalid_request'
  | 'unsupported_media_type'
  | 'network_error'
  | 'unknown';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode | (string & {}),
    message: string,
    /** Seconds, from the Retry-After header. */
    readonly retryAfter?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
