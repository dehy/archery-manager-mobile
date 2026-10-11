/**
 * Calendar apps subscribe to `webcal://` URLs (iOS Calendar, and most Android calendar apps
 * through a handler); the feed itself is served over https.
 */
export const webcalUrl = (url: string) => url.replace(/^https?:\/\//i, 'webcal://');

/** Shows only the end of the secret URL: enough to recognize it, not enough to use it. */
export function maskUrl(url: string): string {
  const tail = url.slice(-6);
  try {
    return `${new URL(url).host}/…${tail}`;
  } catch {
    return `…${tail}`;
  }
}
