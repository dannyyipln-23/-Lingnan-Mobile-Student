import React from 'react';
import { ChevronRight } from 'lucide-react';

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
      <p className="px-0.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
        Select a term
      </p>
      {terms.map((term) => (
        <button
          key={term.code}
          type="button"
          onClick={() => onSelect(term.code)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3 text-left shadow-sm transition hover:bg-[var(--surface-muted)]"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold text-[var(--text-primary)]">{term.description}</p>
                {term.isDefault && <span className="theme-chip">Default</span>}
              </div>
              {term.meta && (
                <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{term.meta}</p>
              )}
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
          </div>
        </button>
      ))}
    </div>
  );
};
