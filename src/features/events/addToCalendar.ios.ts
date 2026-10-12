import * as Calendar from 'expo-calendar';

import type { EventDetail } from '@/api/types';

import { calendarEvent } from './calendarEvent';

/**
 * Opens the system "new event" form, prefilled. Write-only access is enough (iOS 17+): the app
 * never reads the calendar. Resolves false when the user refused access.
 */
export async function addToCalendar(event: EventDetail): Promise<boolean> {
  const { granted } = await Calendar.requestCalendarPermissions(true);
  if (!granted) return false;
  await Calendar.getDefaultCalendarSync().addEventWithForm(calendarEvent(event));
  return true;
}
