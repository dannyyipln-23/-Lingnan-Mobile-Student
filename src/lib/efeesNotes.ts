const EFEES_URL = '/mock/academic/eFees.json';

export type EFeesNote = {
  REPORT_ID: number;
  TERM_YEAR: string;
  PAYMENT_TERM_DESC: string;
  NOTE_DESC: string;
  NOTE_REF_NO: string;
  CHARGED_AMOUNT: number;
  TOTAL_AMOUNT: number;
  TOTAL_SETTLEMENT: number;
  PUBLISH_DATE: string;
  DUE_DATE: string;
  REMARKS: string;
  PAYMENT_REMARKS: string;
};

export type EFeesPayload = {
  success: boolean;
  data: EFeesNote[];
  count: number;
};

export type EFeesNoteStatus = {
  label: string;
  tone: 'overdue' | 'unpaid' | 'settled';
};

export const formatEfeesAmount = (amount: number): string =>
  new Intl.NumberFormat('en-HK', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount);

export const formatEfeesDate = (value: string): string => {
  const dateOnly = value.includes('T') ? value.slice(0, 10) : value;
  const [year, month, day] = dateOnly.split('-').map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
};

export const outstandingOf = (note: EFeesNote): number =>
  Math.max(0, Number(note.TOTAL_AMOUNT ?? note.CHARGED_AMOUNT) - Number(note.TOTAL_SETTLEMENT ?? 0));

export const statusOf = (note: EFeesNote): EFeesNoteStatus => {
  const outstanding = outstandingOf(note);
  if (outstanding <= 0) return { label: 'Settled', tone: 'settled' };
  if (note.PAYMENT_REMARKS) return { label: 'Overdue', tone: 'overdue' };
  return { label: 'Unpaid', tone: 'unpaid' };
};

export const fetchEfeesNotes = async (): Promise<EFeesNote[]> => {
  const res = await fetch(EFEES_URL);
  if (!res.ok) {
    throw new Error(`Failed to load eFees notes (${res.status})`);
  }
  const payload = (await res.json()) as EFeesPayload;
  return payload?.data ?? [];
};

export const unpaidEfeesNotes = (notes: EFeesNote[]): EFeesNote[] =>
  notes.filter((note) => outstandingOf(note) > 0);
