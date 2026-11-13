import React from 'react';
import { ChevronRight, CalendarDays } from 'lucide-react';

export type FlowTerm = {
  code: string;
  description: string;
  isDefault?: boolean;
  meta?: string;
};

interface TermPickerProps {
  terms: FlowTerm[];
  onSelect: (termCode: string) => void;
  emptyLabel?: string;
}

export const TermPicker: React.FC<TermPickerProps> = ({
  terms,
  onSelect,
  emptyLabel = 'No terms available.',
}) => {
  if (terms.length === 0) {
    return (
      <div className="flow-state">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="flow-section-label">Select a term</p>
      {terms.map((term) => (
        <button
          key={term.code}
          type="button"
          onClick={() => onSelect(term.code)}
          className="list-card"
        >
          <div className="list-card__row">
            <div className="list-card__lead">
              <div className="list-card__icon">
                <CalendarDays className="list-card__icon-svg" />
              </div>
              <div className="list-card__text">
                <div className="list-card__title-row">
                  <p className="list-card__title">
                    {term.description}
                  </p>
                  {term.isDefault && <span className="theme-chip">Default</span>}
                </div>
                {term.meta && (
                  <p className="list-card__meta">{term.meta}</p>
                )}
              </div>
            </div>
            <ChevronRight className="list-card__chevron" />
          </div>
        </button>
      ))}
    </div>
  );
};
