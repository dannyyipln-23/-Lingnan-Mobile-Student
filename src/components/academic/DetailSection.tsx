import React from 'react';
import { useAppPreferences } from '../../context/AppPreferencesContext';

export type DetailRow = {
  label: string;
  value: string;
  href?: string;
};

interface DetailSectionProps {
  title?: string;
  rows: DetailRow[];
}

export const DetailSection: React.FC<DetailSectionProps> = ({ title, rows }) => {
  const { openInAppBrowser } = useAppPreferences();

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      {title && (
        <div className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{title}</h3>
        </div>
      )}
      <dl className="divide-y divide-[var(--border)]">
        {rows.map((row) => (
          <div
            key={`${row.label}-${row.value}`}
            className="flex items-start justify-between gap-3 px-3.5 py-2.5"
          >
            <dt className="shrink-0 text-[11px] font-semibold text-[var(--text-muted)]">{row.label}</dt>
            <dd className="break-words text-right text-xs font-semibold text-[var(--text-primary)]">
              {row.href ? (
                <button
                  type="button"
                  className="app-link"
                  onClick={() => openInAppBrowser(row.href!, row.label)}
                >
                  {row.value}
                </button>
              ) : (
                row.value || '—'
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
