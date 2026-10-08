import { ApiError } from '@/api/errors';
import { t } from '@/i18n';

/** Copy for a failed load. The API's `message` is English and never shown. */
export function loadErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.code === 'network_error') return t('common.offline');
  return t('common.loadError');
}

export const isForbidden = (error: unknown) => error instanceof ApiError && error.status === 403;
