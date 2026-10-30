export type CalendarDate = { year: number; month: number; day: number };

const ISO_CALENDAR_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseCalendarDate(value: string): CalendarDate | null {
  const match = ISO_CALENDAR_DATE_PATTERN.exec(value);
  if (!match) return null;

  const [, year, month, day] = match.map(Number);
  const candidate = { year, month, day };
  return existsInCalendar(candidate) ? candidate : null;
}

const brasiliaDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function todayInBrasilia(now: Date = new Date()): CalendarDate {
  const parts = brasiliaDateFormatter.formatToParts(now);
  const readPart = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: readPart("year"),
    month: readPart("month"),
    day: readPart("day"),
  };
}

export function compareCalendarDates(
  left: CalendarDate,
  right: CalendarDate,
): number {
  return (
    left.year - right.year || left.month - right.month || left.day - right.day
  );
}

export function formatCalendarDateBr(date: CalendarDate): string {
  return `${padTwoDigits(date.day)}/${padTwoDigits(date.month)}/${date.year}`;
}

export function formatCalendarDateIso(date: CalendarDate): string {
  return `${date.year}-${padTwoDigits(date.month)}-${padTwoDigits(date.day)}`;
}

function padTwoDigits(value: number): string {
  return String(value).padStart(2, "0");
}

// Date.UTC rolls invalid days over (Feb 31 -> Mar 3), so reading it back exposes days that do not exist.
function existsInCalendar(date: CalendarDate): boolean {
  const utcDate = new Date(Date.UTC(date.year, date.month - 1, date.day));
  return (
    utcDate.getUTCFullYear() === date.year &&
    utcDate.getUTCMonth() === date.month - 1 &&
    utcDate.getUTCDate() === date.day
  );
}
