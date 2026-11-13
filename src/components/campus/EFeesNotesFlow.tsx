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
import {
  EFeesNote,
  fetchEfeesNotes,
  formatEfeesAmount,
  formatEfeesDate,
  outstandingOf,
  statusOf,
} from '../../lib/efeesNotes';

const EFEES_SYSTEM_URL = 'https://uniapp.ln.edu.hk/efees-note-system';

interface EFeesNotesFlowProps {
  onBack: () => void;
}

export const EFeesNotesFlow: React.FC<EFeesNotesFlowProps> = ({ onBack }) => {
  const { openInAppBrowser } = useAppPreferences();
  const [notes, setNotes] = useState<EFeesNote[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchEfeesNotes()
      .then((data) => {
        if (!cancelled) {
          setNotes(data);
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

  const outstandingTotal = useMemo(
    () => (notes ?? []).reduce((sum, note) => sum + outstandingOf(note), 0),
    [notes],
  );

  const openEfeesSystem = () => {
    openInAppBrowser(EFEES_SYSTEM_URL, 'eFees Note System');
  };

  if (error) {
    return (
      <AcademicFlowShell title="eFees Notes" theme="fees" onBack={onBack}>
        <div className="flow-state flow-state--error">{error}</div>
      </AcademicFlowShell>
    );
  }

  if (!notes) {
    return (
      <AcademicFlowShell title="eFees Notes" theme="fees" onBack={onBack}>
        <div className="flow-state">Loading…</div>
      </AcademicFlowShell>
    );
  }

  return (
    <AcademicFlowShell
      title="eFees Notes"
      subtitle={`${notes.length} published note${notes.length === 1 ? '' : 's'}`}
      theme="fees"
      onBack={onBack}
      backLabel="Services"
      footer={
        <button type="button" onClick={openEfeesSystem} className="fees-cta">
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Check more details in eFees Note System</span>
        </button>
      }
    >
      <div className="fees-stack">
        <div className="flow-hero">
          <p className="flow-hero__eyebrow">Outstanding balance</p>
          <div className="fees-hero__row">
            <p className="flow-hero__value">
              <span className="fees-hero__currency">HK$</span>
              {formatEfeesAmount(outstandingTotal)}
            </p>
            <div className="fees-hero__icon">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p className="flow-hero__caption">Across all published eFees notes</p>
        </div>

        {notes.length === 0 ? (
          <div className="flow-state flow-state--empty">No eFees notes available.</div>
        ) : (
          notes.map((note) => {
            const amount = note.TOTAL_AMOUNT ?? note.CHARGED_AMOUNT;
            const remarks = note.PAYMENT_REMARKS || note.REMARKS;
            const status = statusOf(note);

            return (
              <article key={note.REPORT_ID} className="fees-card">
                <div className="fees-card__head">
                  <div className="fees-card__head-row">
                    <div className="fees-card__lead">
                      <div className="fees-card__chips">
                        <span className="fees-card__badge">
                          <FileText className="h-3 w-3" />
                          eFee Note
                        </span>
                        <span className={`fees-status fees-status--${status.tone}`}>
                          {status.label}
                        </span>
                      </div>
                      <h3 className="fees-card__title">{note.NOTE_DESC}</h3>
                      <p className="fees-card__meta">
                        {note.TERM_YEAR} · {note.PAYMENT_TERM_DESC}
                      </p>
                    </div>
                  </div>

                  <div className="fees-amount">
                    <p className="fees-amount__label">Amount (HKD)</p>
                    <p className="fees-amount__value">{formatEfeesAmount(amount)}</p>
                  </div>
                </div>

                <div className="fees-card__body">
                  <div className="fees-meta-grid">
                    <div className="fees-meta">
                      <p className="fees-meta__label">
                        <CalendarDays className="h-3 w-3" />
                        Publish Date
                      </p>
                      <p className="fees-meta__value">{formatEfeesDate(note.PUBLISH_DATE)}</p>
                    </div>
                    <div className="fees-meta">
                      <p className="fees-meta__label">
                        <CalendarDays className="h-3 w-3" />
                        Due Date
                      </p>
                      <p className="fees-meta__value">{formatEfeesDate(note.DUE_DATE)}</p>
                    </div>
                  </div>

                  <div className="fees-meta">
                    <p className="fees-meta__label">
                      <Hash className="h-3 w-3" />
                      Ref No.
                    </p>
                    <p className="fees-meta__value fees-meta__value--mono">{note.NOTE_REF_NO}</p>
                  </div>

                  <div className="fees-meta">
                    <p className="fees-meta__label">Type</p>
                    <p className="fees-meta__value">{note.NOTE_DESC}</p>
                  </div>

                  {remarks ? (
                    <div className="fees-remarks fees-remarks--warn">
                      <AlertTriangle className="fees-remarks__icon" />
                      <div>
                        <p className="fees-remarks__title">Remarks</p>
                        <p className="fees-remarks__text">{remarks}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="fees-remarks fees-remarks--ok">
                      <CheckCircle2 className="fees-remarks__icon" />
                      <div>
                        <p className="fees-remarks__title">Remarks</p>
                        <p className="fees-remarks__text">No remarks</p>
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
