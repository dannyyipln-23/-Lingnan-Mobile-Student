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
    <section className="flow-detail">
      {title && (
        <div className="flow-detail__head">
          <h3 className="flow-detail__title">
            {title}
          </h3>
        </div>
      )}
      <dl className="flow-detail__list">
        {rows.map((row, idx) => (
          <div
            key={`${row.label}-${row.value}`}
            className={`flow-detail__row${idx > 0 ? ' is-divided' : ''}`}
          >
            <dt className="flow-detail__label">{row.label}</dt>
            <dd className="flow-detail__value">
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
