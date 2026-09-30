import React from 'react';
import { ArrowLeft } from 'lucide-react';

export type FlowTheme = 'results' | 'exam' | 'schedule' | 'early' | 'graduation' | 'elgr' | 'default';

interface AcademicFlowShellProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  backLabel?: string;
  theme?: FlowTheme;
  stepIndex?: number;
  stepCount?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AcademicFlowShell: React.FC<AcademicFlowShellProps> = ({
  title,
  subtitle,
  onBack,
  backLabel = 'Back',
  theme = 'default',
  stepIndex,
  stepCount,
  children,
  footer,
}) => {
  const showSteps =
    typeof stepIndex === 'number' && typeof stepCount === 'number' && stepCount > 1;

  return (
    <div className={`flow-shell flow-theme-${theme}`}>
      <div className="flow-shell__glow" />

      <div className="relative flex flex-1 flex-col space-y-4">
        <header className="space-y-1">
          <div className="flex items-start gap-2.5">
            <button type="button" onClick={onBack} className="flow-shell__back">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{backLabel}</span>
            </button>
            <div className="min-w-0 flex-1 pt-0.5">
              <h2 className="flow-shell__title">{title}</h2>
              {subtitle && <p className="flow-shell__subtitle">{subtitle}</p>}
              {showSteps && (
                <div className="flow-shell__steps" aria-label={`Step ${stepIndex! + 1} of ${stepCount}`}>
                  {Array.from({ length: stepCount! }).map((_, index) => (
                    <span
                      key={index}
                      className={`flow-shell__step-dot${index === stepIndex ? ' is-active' : ''}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col space-y-4">
          {children}
          {footer}
        </div>
      </div>
    </div>
  );
};
