import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, CircleAlert } from 'lucide-react';
import { AcademicFlowShell } from './AcademicFlowShell';

type GraduationPayload = {
  title: string;
  subtitle?: string;
  program?: {
    name: string;
    degreeCode?: string;
    siteName?: string;
  };
  requirements: Array<{
    id: string;
    label: string;
    fulfilled: boolean;
    detail: string;
    count?: number;
    needed?: boolean;
  }>;
  sourceNote?: string;
};

interface MyGraduationRequirementsFlowProps {
  onBack: () => void;
}

export const MyGraduationRequirementsFlow: React.FC<MyGraduationRequirementsFlowProps> = ({
  onBack,
}) => {
  const [payload, setPayload] = useState<GraduationPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/mock/academic/my-graduation-requirements.json')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load graduation requirements (${res.status})`);
        }
        return res.json() as Promise<GraduationPayload>;
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

  const fulfilledCount = useMemo(
    () => payload?.requirements.filter((req) => req.fulfilled).length ?? 0,
    [payload],
  );
  const totalRequirements = payload?.requirements.length ?? 0;
  const progressPct =
    totalRequirements > 0 ? Math.round((fulfilledCount / totalRequirements) * 100) : 0;

  if (error) {
    return (
      <AcademicFlowShell title="My Graduation Requirements" theme="graduation" onBack={onBack}>
        <div className="flow-state flow-state--error">{error}</div>
      </AcademicFlowShell>
    );
  }

  if (!payload) {
    return (
      <AcademicFlowShell title="My Graduation Requirements" theme="graduation" onBack={onBack}>
        <div className="flow-state">Loading…</div>
      </AcademicFlowShell>
    );
  }

  return (
    <AcademicFlowShell
      title="My Graduation Requirements"
      subtitle={payload.program?.name ?? payload.subtitle}
      theme="graduation"
      onBack={onBack}
      backLabel="Academic"
      stepIndex={0}
      stepCount={1}
    >
      <div className="space-y-3">
        <div className="flow-hero">
          <p className="flow-hero__eyebrow">Checklist progress</p>
          <div className="grad-progress__head">
            <p className="flow-hero__value">
              {fulfilledCount}
              <span className="flow-hero__unit">/{totalRequirements}</span>
            </p>
            <p className="grad-progress__pct">{progressPct}%</p>
          </div>
          <div className="grad-progress__track">
            <div
              className="grad-progress__bar"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {payload.program && (
            <p className="flow-hero__caption">
              {payload.program.degreeCode}
              {payload.program.siteName ? ` · ${payload.program.siteName}` : ''}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <p className="flow-section-label">Requirements</p>
          {payload.requirements.map((req) => (
            <div
              key={req.id}
              className="grad-req"
            >
              {req.fulfilled ? (
                <CheckCircle2 className="grad-req__icon is-done" />
              ) : (
                <CircleAlert className="grad-req__icon is-pending" />
              )}
              <div className="grad-req__body">
                <p className="grad-req__label">{req.label}</p>
                <p className="grad-req__detail">{req.detail}</p>
              </div>
              <span
                className={`status-chip${req.fulfilled ? ' status-chip--good' : ' status-chip--warn'}`}
              >
                {req.fulfilled ? 'Done' : 'Pending'}
              </span>
            </div>
          ))}
        </div>

        {/* {payload.sourceNote && (
          <p className="px-0.5 text-[10px] text-slate-400">{payload.sourceNote}</p>
        )} */}
      </div>
    </AcademicFlowShell>
  );
};
