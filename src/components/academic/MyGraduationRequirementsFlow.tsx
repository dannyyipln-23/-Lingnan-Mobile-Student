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
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">{error}</div>
      </AcademicFlowShell>
    );
  }

  if (!payload) {
    return (
      <AcademicFlowShell title="My Graduation Requirements" theme="graduation" onBack={onBack}>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500">Loading…</div>
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
          <div className="mt-1 flex items-end justify-between gap-2">
            <p className="flow-hero__value">
              {fulfilledCount}
              <span className="text-base font-semibold text-slate-500">/{totalRequirements}</span>
            </p>
            <p className="pb-1 text-sm font-bold text-emerald-800">{progressPct}%</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
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
              className="flex items-start gap-2.5 rounded-[1rem] border border-slate-200 bg-white px-3.5 py-3 shadow-[0_4px_14px_rgb(15_23_42_/_0.04)]"
            >
              {req.fulfilled ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold tracking-tight text-slate-900">{req.label}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">{req.detail}</p>
              </div>
              <span
                className={`ml-auto shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                  req.fulfilled
                    ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                    : 'border-amber-100 bg-amber-50 text-amber-800'
                }`}
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
