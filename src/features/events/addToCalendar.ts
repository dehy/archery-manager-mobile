// The legacy API is used on purpose: its form opens the calendar app without any permission,
// where the new `addEventWithForm` needs a calendar object, hence read access, on Android.
import { createEventInCalendarAsync } from 'expo-calendar/legacy';

import type { EventDetail } from '@/api/types';

import { calendarEvent } from './calendarEvent';

/** Opens the system "new event" form, prefilled (Android: the calendar app's insert screen). */
export async function addToCalendar(event: EventDetail): Promise<boolean> {
  await createEventInCalendarAsync(calendarEvent(event));
  return true;
}
