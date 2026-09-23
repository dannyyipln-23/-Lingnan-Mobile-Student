import React from 'react';
import { ArrowLeft } from 'lucide-react';

export type FlowTheme = 'results' | 'exam' | 'schedule' | 'early' | 'graduation' | 'default';

interface AcademicFlowShellProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  backLabel?: string;
  theme?: FlowTheme;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AcademicFlowShell: React.FC<AcademicFlowShellProps> = ({
  title,
  subtitle,
  onBack,
  backLabel = 'Back',
  theme = 'default',
  children,
  footer,
}) => {
  return (
    <div className={`flow-shell flow-theme-${theme}`}>
      <div className="flow-shell__glow" />

      <div className="relative space-y-4 pb-24">
        <div className="flex items-start gap-2">
          <button type="button" onClick={onBack} className="flow-shell__back">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{backLabel}</span>
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="flow-shell__title">{title}</h2>
            {subtitle && <p className="flow-shell__subtitle">{subtitle}</p>}
          </div>
        </div>

        {children}
        {footer}
      </div>
    </div>
  );
};
