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
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-xs text-[var(--text-muted)]">
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
          <div className="flex items-center justify-between gap-2 pl-1.5">
            <div className="flex min-w-0 items-start gap-2.5">
              <div
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: 'color-mix(in srgb, var(--flow-accent) 12%, white)',
                  color: 'var(--flow-accent)',
                }}
              >
                <CalendarDays className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
                    {term.description}
                  </p>
                  {term.isDefault && <span className="theme-chip">Default</span>}
                </div>
                {term.meta && (
                  <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{term.meta}</p>
                )}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
          </div>
        </button>
      ))}
    </div>
  );
};
