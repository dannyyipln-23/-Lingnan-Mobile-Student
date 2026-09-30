import React from 'react';
import { ChevronRight } from 'lucide-react';

type Tone = 'default' | 'good' | 'warn' | 'muted';

interface FlowListCardProps {
  title: string;
  subtitle?: string;
  meta?: string;
  status?: string;
  statusTone?: Tone;
  onClick: () => void;
}

const toneClass: Record<Tone, string> = {
  default: 'status-chip',
  good: 'status-chip status-chip--good',
  warn: 'status-chip status-chip--warn',
  muted: 'status-chip status-chip--muted',
};

export const FlowListCard: React.FC<FlowListCardProps> = ({
  title,
  subtitle,
  meta,
  status,
  statusTone = 'default',
  onClick,
}) => {
  return (
    <button type="button" onClick={onClick} className="list-card">
      <div className="flex items-start justify-between gap-2 pl-1.5">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold tracking-tight text-[var(--text-primary)]">{title}</p>
          {subtitle && (
            <p className="mt-0.5 text-[11px] leading-snug text-[var(--text-secondary)]">{subtitle}</p>
          )}
          {meta && <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">{meta}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
          {status && <span className={toneClass[statusTone]}>{status}</span>}
          <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
        </div>
      </div>
    </button>
  );
};
