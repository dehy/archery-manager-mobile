import type { EventDetail } from '@/api/types';

/** Link that opens the platform's maps app on the event's place, or null without any location. */
export function mapsUrl(
  event: Pick<EventDetail, 'title' | 'address' | 'latitude' | 'longitude'>,
  platform: 'ios' | 'android',
): string | null {
  const { latitude, longitude, address, title } = event;
  const hasCoordinates = latitude != null && longitude != null;
  const place = address?.replace(/\n/g, ', ');

  if (platform === 'ios') {
    if (hasCoordinates) {
      return `https://maps.apple.com/?ll=${latitude},${longitude}&q=${encodeURIComponent(title)}`;
    }
    return place ? `https://maps.apple.com/?q=${encodeURIComponent(place)}` : null;
  }
  if (hasCoordinates)
    return `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodeURIComponent(title)})`;
  return place ? `geo:0,0?q=${encodeURIComponent(place)}` : null;
}
