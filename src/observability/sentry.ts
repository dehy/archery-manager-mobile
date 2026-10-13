import * as Sentry from '@sentry/react-native';

import { getApiUrl } from '@/api/config';

/** Which backend this build talks to, so production crashes stay apart from staging ones. */
function environment(): string {
  const host = getApiUrl().replace(/^https?:\/\//, '');
  if (host === 'app.karkwa.fr') return 'production';
  if (host === 'app.staging.karkwa.fr') return 'staging';
  return 'development';
}

/**
 * Crash reporting only: no personal data (members' names, emails, IPs), no screenshots, no
 * session replay, no performance tracing. Off in development builds.
 */
Sentry.init({
  dsn: 'https://81778e2386ef95e767a527c16de79298@o1283927.ingest.us.sentry.io/4512247376707584',
  enabled: !__DEV__,
  environment: environment(),
  sendDefaultPii: false,
  attachScreenshot: false,
  attachViewHierarchy: false,
  enableLogs: false,
});

export { Sentry };
