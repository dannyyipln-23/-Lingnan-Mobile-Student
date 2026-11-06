import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileText,
  Hash,
  Wallet,
} from 'lucide-react';
import { AcademicFlowShell } from '../academic/AcademicFlowShell';
import { useAppPreferences } from '../../context/AppPreferencesContext';

const EFEES_SYSTEM_URL = 'https://uniapp.ln.edu.hk/efees-note-system';

type EFeesNote = {
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

type EFeesPayload = {
  success: boolean;
  data: EFeesNote[];
  count: number;
};

interface EFeesNotesFlowProps {
  onBack: () => void;
}

const formatAmount = (amount: number): string =>
  new Intl.NumberFormat('en-HK', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (value: string): string => {
  const dateOnly = value.includes('T') ? value.slice(0, 10) : value;
  const [year, month, day] = dateOnly.split('-').map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
};

const outstandingOf = (note: EFeesNote): number =>
  Math.max(0, Number(note.TOTAL_AMOUNT ?? note.CHARGED_AMOUNT) - Number(note.TOTAL_SETTLEMENT ?? 0));

const statusOf = (note: EFeesNote): { label: string; tone: 'overdue' | 'unpaid' | 'settled' } => {
  const outstanding = outstandingOf(note);
  if (outstanding <= 0) return { label: 'Settled', tone: 'settled' };
  if (note.PAYMENT_REMARKS) return { label: 'Overdue', tone: 'overdue' };
  return { label: 'Unpaid', tone: 'unpaid' };
};

export const EFeesNotesFlow: React.FC<EFeesNotesFlowProps> = ({ onBack }) => {
  const { openInAppBrowser } = useAppPreferences();
  const [payload, setPayload] = useState<EFeesPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/mock/academic/eFees.json')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load eFees notes (${res.status})`);
        }
        return res.json() as Promise<EFeesPayload>;
      })
      .then((data) => {
        if (!cancelled) {
          setPayload(data);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const notes = payload?.data ?? [];
  const outstandingTotal = useMemo(
    () => notes.reduce((sum, note) => sum + outstandingOf(note), 0),
    [notes],
  );

  const openEfeesSystem = () => {
    openInAppBrowser(EFEES_SYSTEM_URL, 'eFees Note System');
  };

  if (error) {
    return (
      <AcademicFlowShell title="eFees Notes" theme="fees" onBack={onBack}>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">{error}</div>
      </AcademicFlowShell>
    );
  }

  if (!payload) {
    return (
      <AcademicFlowShell title="eFees Notes" theme="fees" onBack={onBack}>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
          Loading…
        </div>
      </AcademicFlowShell>
    );
  }

  return (
    <AcademicFlowShell
      title="eFees Notes"
      subtitle={`${payload.count} published note${payload.count === 1 ? '' : 's'}`}
      theme="fees"
      onBack={onBack}
      backLabel="Services"
      footer={
        <button
          type="button"
          onClick={openEfeesSystem}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#9f1239] px-3 py-3 text-xs font-bold text-white shadow-[0_8px_20px_rgba(159,18,57,0.25)] transition hover:bg-[#881337]"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Check more details in eFees Note System</span>
        </button>
      }
    >
      <div className="space-y-3">
        <div className="flow-hero">
          <p className="flow-hero__eyebrow">Outstanding balance</p>
          <div className="mt-1 flex items-end justify-between gap-2">
            <p className="flow-hero__value">
              <span className="mr-1 text-base font-semibold text-slate-500">HK$</span>
              {formatAmount(outstandingTotal)}
            </p>
            <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-white/80 text-rose-700">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p className="flow-hero__caption">Across all published eFees notes</p>
        </div>

        {notes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-4 text-center text-[11px] text-slate-500">
            No eFees notes available.
          </div>
        ) : (
          notes.map((note) => {
            const amount = note.TOTAL_AMOUNT ?? note.CHARGED_AMOUNT;
            const remarks = note.PAYMENT_REMARKS || note.REMARKS;
            const status = statusOf(note);

            return (
              <article
                key={note.REPORT_ID}
                className="overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
              >
                <div className="border-b border-rose-50 bg-gradient-to-r from-rose-50 to-white px-3.5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-rose-700">
                          <FileText className="h-3 w-3" />
                          eFee Note
                        </span>
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                            status.tone === 'settled'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : status.tone === 'overdue'
                                ? 'border-amber-200 bg-amber-50 text-amber-800'
                                : 'border-rose-200 bg-rose-50 text-rose-700'
                          }`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold tracking-tight text-slate-900">{note.NOTE_DESC}</h3>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {note.TERM_YEAR} · {note.PAYMENT_TERM_DESC}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border border-rose-100 bg-white/90 px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Amount (HKD)
                    </p>
                    <p className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900">
                      {formatAmount(amount)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 px-3.5 py-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-2">
                      <p className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        <CalendarDays className="h-3 w-3" />
                        Publish Date
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-800">
                        {formatDate(note.PUBLISH_DATE)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-2">
                      <p className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        <CalendarDays className="h-3 w-3" />
                        Due Date
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-800">
                        {formatDate(note.DUE_DATE)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-2">
                    <p className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      <Hash className="h-3 w-3" />
                      Ref No.
                    </p>
                    <p className="mt-1 break-all font-mono text-[11px] font-semibold text-slate-800">
                      {note.NOTE_REF_NO}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Type</p>
                    <p className="mt-1 text-xs font-semibold text-slate-800">{note.NOTE_DESC}</p>
                  </div>

                  {remarks ? (
                    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-2.5">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-amber-800">
                          Remarks
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-amber-950">{remarks}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-2.5">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                          Remarks
                        </p>
                        <p className="mt-0.5 text-xs text-emerald-900">No remarks</p>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </AcademicFlowShell>
  );
};
