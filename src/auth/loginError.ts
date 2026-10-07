import { ApiError } from '@/api/errors';
import { t } from '@/i18n';

export function loginErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'too_many_attempts') {
      return t('errors.too_many_attempts', {
        minutes: Math.max(1, Math.ceil((error.retryAfter ?? 60) / 60)),
      });
    }
    const message = t(`errors.${error.code}`, { defaultValue: '' });
    if (message) return message;
  }
  return t('errors.unknown');
}
