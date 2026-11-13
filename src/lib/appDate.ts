/** App-wide “today” helpers — always use the device’s current local date. */

export const pad2 = (n: number): string => String(n).padStart(2, '0');

/** Local calendar date as YYYY-MM-DD. */
export const formatDateKey = (date: Date = new Date()): string => {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

/** Start of today in local time. */
export const getToday = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/** Academic weekday: 1 = Mon … 7 = Sun. */
export const toAcademicDay = (date: Date = new Date()): number => {
  const jsDay = date.getDay();
  return jsDay === 0 ? 7 : jsDay;
};

/** Minutes since midnight from "09:30", "9:30 AM", "13:30", etc. */
export const parseTimeToMinutes = (token: string): number | null => {
  const raw = token.trim();
  const withMeridiem = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (withMeridiem) {
    let hours = Number(withMeridiem[1]);
    const minutes = Number(withMeridiem[2]);
    const meridiem = withMeridiem[3].toUpperCase();
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  const twentyFour = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFour) {
    return Number(twentyFour[1]) * 60 + Number(twentyFour[2]);
  }

  return null;
};

export const formatMinutesAsTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${pad2(hours)}:${pad2(minutes)}`;
};

export const nowMinutes = (date: Date = new Date()): number =>
  date.getHours() * 60 + date.getMinutes();
