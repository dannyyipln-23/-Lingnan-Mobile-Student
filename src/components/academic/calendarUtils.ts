export type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
};

const pad2 = (value: number) => String(value).padStart(2, '0');

export const formatIcsDateTime = (date: Date) => {
  return [
    date.getUTCFullYear(),
    pad2(date.getUTCMonth() + 1),
    pad2(date.getUTCDate()),
    'T',
    pad2(date.getUTCHours()),
    pad2(date.getUTCMinutes()),
    pad2(date.getUTCSeconds()),
    'Z',
  ].join('');
};

export const escapeIcsText = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

export const downloadCalendarEvent = (event: CalendarEvent) => {
  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lingnan Mobile Student//Academic Calendar//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}-${Math.random().toString(36).slice(2)}@lingnan-mobile-student`,
    `DTSTAMP:${formatIcsDateTime(new Date())}`,
    `DTSTART:${formatIcsDateTime(event.start)}`,
    `DTEND:${formatIcsDateTime(event.end)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    event.location ? `LOCATION:${escapeIcsText(event.location)}` : '',
    event.description ? `DESCRIPTION:${escapeIcsText(event.description)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');

  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'exam'}-event.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

const monthMap: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

const parseTimeToken = (token: string): { hours: number; minutes: number } | null => {
  const match = token.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hours < 12) {
    hours += 12;
  }
  if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
};

/** Parse strings like "Fri Mar 06, 2026" or "06 Mar 2026 (Fri)". */
export const parseExamDate = (raw: string): { year: number; month: number; day: number } | null => {
  const isoLike = raw.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoLike) {
    return {
      year: Number(isoLike[1]),
      month: Number(isoLike[2]) - 1,
      day: Number(isoLike[3]),
    };
  }

  const usStyle = raw.match(/([A-Za-z]{3})\s+(\d{1,2}),\s*(\d{4})/);
  if (usStyle) {
    const month = monthMap[usStyle[1].slice(0, 3).toLowerCase()];
    if (month === undefined) {
      return null;
    }
    return { year: Number(usStyle[3]), month, day: Number(usStyle[2]) };
  }

  const dayFirst = raw.match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
  if (dayFirst) {
    const month = monthMap[dayFirst[2].slice(0, 3).toLowerCase()];
    if (month === undefined) {
      return null;
    }
    return { year: Number(dayFirst[3]), month, day: Number(dayFirst[1]) };
  }

  return null;
};

export const buildExamCalendarEvent = (input: {
  title: string;
  examDate: string;
  beginTime: string;
  endTime: string;
  venue?: string;
  description?: string;
}): CalendarEvent | null => {
  const dateParts = parseExamDate(input.examDate);
  const begin = parseTimeToken(input.beginTime);
  const end = parseTimeToken(input.endTime);
  if (!dateParts || !begin || !end) {
    return null;
  }

  const start = new Date(dateParts.year, dateParts.month, dateParts.day, begin.hours, begin.minutes, 0);
  const endDate = new Date(dateParts.year, dateParts.month, dateParts.day, end.hours, end.minutes, 0);

  return {
    title: input.title,
    start,
    end: endDate,
    location: input.venue,
    description: input.description,
  };
};
