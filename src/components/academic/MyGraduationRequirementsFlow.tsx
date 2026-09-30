import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, CircleAlert, ChevronRight } from 'lucide-react';
import { AcademicFlowShell } from './AcademicFlowShell';
import { DetailSection } from './DetailSection';
import { FlowListCard } from './FlowListCard';

type FlowStep = 'overview' | 'history' | 'detail';

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
  academicHistory: Array<{
    id: string;
    termCode: string;
    description: string;
    academicYear: string;
    levelCode: string;
    termGpa: string;
    yearlyGpa: string | null;
    cumGpa: string;
    standingCode: string | null;
    standing: string | null;
    deanList: string | null;
    degreeCode: string;
    admitTerm: string;
  }>;
};

interface MyGraduationRequirementsFlowProps {
  onBack: () => void;
}

const stepIndexMap: Record<FlowStep, number> = { overview: 0, history: 1, detail: 2 };

export const MyGraduationRequirementsFlow: React.FC<MyGraduationRequirementsFlowProps> = ({
  onBack,
}) => {
  const [payload, setPayload] = useState<GraduationPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<FlowStep>('overview');
  const [historyId, setHistoryId] = useState<string>('');

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

  const historyItem = useMemo(
    () => payload?.academicHistory.find((row) => row.id === historyId),
    [payload, historyId],
  );

  const handleBack = () => {
    if (step === 'detail') {
      setStep('history');
      setHistoryId('');
      return;
    }
    if (step === 'history') {
      setStep('overview');
      return;
    }
    onBack();
  };

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
      subtitle={
        step === 'overview'
          ? payload.program?.name ?? payload.subtitle
          : step === 'history'
            ? 'Academic History'
            : historyItem?.description
      }
      theme="graduation"
      onBack={handleBack}
      backLabel={step === 'overview' ? 'Campus' : 'Back'}
      stepIndex={stepIndexMap[step]}
      stepCount={3}
    >
      {step === 'overview' && (
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

          <button
            type="button"
            onClick={() => setStep('history')}
            className="list-card"
          >
            <div className="flex items-center justify-between gap-2 pl-1.5">
              <div>
                <p className="text-sm font-bold tracking-tight text-slate-900">Academic History</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {payload.academicHistory.length} term record(s) · GPA & standing
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
          </button>

          {payload.sourceNote && (
            <p className="px-0.5 text-[10px] text-slate-400">{payload.sourceNote}</p>
          )}
        </div>
      )}

      {step === 'history' && (
        <div className="space-y-2">
          <p className="flow-section-label">Terms</p>
          {payload.academicHistory.map((row) => (
            <FlowListCard
              key={row.id}
              title={row.description}
              subtitle={`Term GPA ${row.termGpa} · cGPA ${row.cumGpa}`}
              meta={row.standing ?? row.academicYear}
              status={row.standing ? 'Standing' : row.levelCode}
              statusTone={row.standing ? 'good' : 'muted'}
              onClick={() => {
                setHistoryId(row.id);
                setStep('detail');
              }}
            />
          ))}
        </div>
      )}

      {step === 'detail' && historyItem && (
        <div className="space-y-3">
          <div className="flow-hero">
            <p className="flow-hero__eyebrow">{historyItem.academicYear}</p>
            <p className="mt-1 text-lg font-bold tracking-tight text-slate-900">
              {historyItem.description}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-emerald-100 bg-white/80 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Term GPA</p>
                <p className="mt-0.5 text-lg font-bold text-slate-900">{historyItem.termGpa}</p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-white/80 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">cGPA</p>
                <p className="mt-0.5 text-lg font-bold text-slate-900">{historyItem.cumGpa}</p>
              </div>
            </div>
          </div>
          <DetailSection
            title="Term record"
            rows={[
              { label: 'Level', value: historyItem.levelCode },
              { label: 'Term code', value: historyItem.termCode },
              { label: 'Yearly GPA', value: historyItem.yearlyGpa ?? '—' },
              { label: 'Standing', value: historyItem.standing ?? '—' },
              { label: 'Standing code', value: historyItem.standingCode ?? '—' },
              { label: "Dean's list", value: historyItem.deanList ?? '—' },
              { label: 'Degree', value: historyItem.degreeCode },
              { label: 'Admit term', value: historyItem.admitTerm },
            ]}
          />
        </div>
      )}
    </AcademicFlowShell>
  );
};
