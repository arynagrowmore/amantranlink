import { WeddingEvent } from '../types/wedding';

/**
 * Parses date string (e.g. "10 December 2026", "2026-12-10", "10 Dec 2026") and time string ("06:30 PM")
 * into a valid Date object.
 */
export function parseEventDateTime(dateStr: string, timeStr?: string): Date {
  const cleanDate = (dateStr || '').replace(/[·,]/g, ' ').trim();
  let baseDate = new Date(cleanDate);

  if (isNaN(baseDate.getTime())) {
    const parts = cleanDate.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (parts) {
      baseDate = new Date(Number(parts[3]), Number(parts[2]) - 1, Number(parts[1]));
    } else {
      baseDate = new Date();
    }
  }

  if (timeStr) {
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const meridiem = timeMatch[3]?.toUpperCase();

      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;

      baseDate.setHours(hours, minutes, 0, 0);
    }
  }

  return baseDate;
}

function formatIcsDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

/**
 * Generates an .ics file Blob and initiates download in the browser.
 */
export function downloadEventIcs(event: WeddingEvent, coupleNames: string, defaultVenue?: string) {
  const startDate = parseEventDateTime(event.date, event.time);
  const endDate = new Date(startDate.getTime() + (3 * 60 * 60 * 1000));

  const summary = `${event.name || 'Wedding Rasam'} — ${coupleNames || 'Royal Wedding'}`;
  const description = [
    `Ceremony: ${event.name}`,
    event.dressCode ? `Dress Code: ${event.dressCode}` : '',
    event.venue ? `Venue: ${event.venue}` : '',
    `Wedding of ${coupleNames}`,
    'Digital Invitation by AmantranLink',
  ].filter(Boolean).join('\\n');

  const location = event.venue || defaultVenue || 'Wedding Venue';
  const nowStr = formatIcsDate(new Date());
  const startStr = formatIcsDate(startDate);
  const endStr = formatIcsDate(endDate);
  const uid = `amantranlink-${event.id || Date.now()}@amantranlink.in`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AmantranLink//Royal Wedding Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${event.name.replace(/[^a-zA-Z0-9]/g, '_')}_AmantranLink.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates a Google Calendar web link for 1-click addition.
 */
export function getGoogleCalendarUrl(event: WeddingEvent, coupleNames: string, defaultVenue?: string): string {
  const startDate = parseEventDateTime(event.date, event.time);
  const endDate = new Date(startDate.getTime() + (3 * 60 * 60 * 1000));

  const pad = (n: number) => String(n).padStart(2, '0');
  const formatGCal = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

  const dates = `${formatGCal(startDate)}/${formatGCal(endDate)}`;
  const title = encodeURIComponent(`${event.name || 'Wedding Celebration'} — ${coupleNames || 'Wedding'}`);
  const details = encodeURIComponent(
    `Ceremony: ${event.name}\n${event.dressCode ? `Dress Code: ${event.dressCode}\n` : ''}${event.venue ? `Venue: ${event.venue}\n` : ''}Cordially invited by ${coupleNames}. Powered by AmantranLink.`
  );
  const location = encodeURIComponent(event.venue || defaultVenue || '');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}
