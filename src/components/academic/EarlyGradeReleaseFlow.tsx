import React, { useEffect, useMemo, useState } from 'react';
import { AcademicFlowShell } from './AcademicFlowShell';
import { DetailSection } from './DetailSection';
import { FlowListCard } from './FlowListCard';
import { TermPicker } from './TermPicker';

type FlowStep = 'term' | 'list' | 'detail';

type EarlyGradePayload = {
  title: string;
  subtitle?: string;
  windowStatus?: {
    currentWindow?: string;
    nextWindow?: string;
    rules?: string[];
  };
  terms: Array<{
    code: string;
    description: string;
    isDefault?: boolean;
  }>;
  itemsByTerm: Record<
    string,
    Array<{
      id: string;
      crn: string;
      subjectCode: string;
      courseNumber: string;
      courseTitle: string;
      finalGrade: string;
      releaseReady: string;
      isEarly: string;
    }>
  >;
  detailsById: Record<
    string,
    {
      crn: string;
      subjectCode: string;
      courseNumber: string;
      courseTitle: string;
      finalGrade: string;
      gradeDate?: string;
      releaseReady: string;
      isEarly: string;
      isEndo?: string;
      markFinalCopyInd?: string;
      termCode?: string;
      sourceNote?: string;
    }
  >;
};

interface EarlyGradeReleaseFlowProps {
  onBack: () => void;
}

const stepIndexMap: Record<FlowStep, number> = { term: 0, list: 1, detail: 2 };

export const EarlyGradeReleaseFlow: React.FC<EarlyGradeReleaseFlowProps> = ({ onBack }) => {
  const [payload, setPayload] = useState<EarlyGradePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<FlowStep>('term');
  const [termCode, setTermCode] = useState<string>('');
  const [itemId, setItemId] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    fetch('/mock/academic/early-grade-release.json')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load early grade release (${res.status})`);
        }
        return res.json() as Promise<EarlyGradePayload>;
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

  const selectedTerm = useMemo(
    () => payload?.terms.find((term) => term.code === termCode),
    [payload, termCode],
  );
  const items = useMemo(() => payload?.itemsByTerm[termCode] ?? [], [payload, termCode]);
  const detail = itemId ? payload?.detailsById[itemId] : undefined;
  const readyCount = useMemo(
    () => items.filter((item) => item.releaseReady === 'Yes').length,
    [items],
  );

  const handleBack = () => {
    if (step === 'detail') {
      setStep('list');
      setItemId('');
      return;
    }
    if (step === 'list') {
      setStep('term');
      setTermCode('');
      return;
    }
    onBack();
  };

  if (error) {
    return (
      <AcademicFlowShell title="Early Grade Release" theme="early" onBack={onBack}>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">{error}</div>
      </AcademicFlowShell>
    );
  }

  if (!payload) {
    return (
      <AcademicFlowShell title="Early Grade Release" theme="early" onBack={onBack}>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500">Loading…</div>
      </AcademicFlowShell>
    );
  }

  return (
    <AcademicFlowShell
      title="Early Grade Release"
      subtitle={
        step === 'term'
          ? payload.subtitle
          : step === 'list'
            ? selectedTerm?.description
            : detail?.courseTitle
      }
      theme="early"
      onBack={handleBack}
      backLabel={step === 'term' ? 'Campus' : 'Back'}
      stepIndex={stepIndexMap[step]}
      stepCount={3}
    >
      {step === 'term' && (
        <div className="space-y-3">
          {payload.windowStatus && (
            <div className="flow-hero space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="flow-hero__eyebrow">Current window</p>
                  <p className="mt-1 text-base font-bold tracking-tight text-slate-900">
                    {payload.windowStatus.currentWindow}
                  </p>
                </div>
                <div className="text-right">
                  <p className="flow-hero__eyebrow">Next</p>
                  <p className="mt-1 text-base font-bold tracking-tight text-slate-900">
                    {payload.windowStatus.nextWindow}
                  </p>
                </div>
              </div>
              {payload.windowStatus.rules && (
                <ul className="space-y-1 border-t border-amber-200/70 pt-2.5 text-[11px] leading-relaxed text-slate-600">
                  {payload.windowStatus.rules.map((rule) => (
                    <li key={rule} className="flex gap-1.5">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-600" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <TermPicker
            terms={payload.terms.map((term) => {
              const termItems = payload.itemsByTerm[term.code] ?? [];
              const termReady = termItems.filter((item) => item.releaseReady === 'Yes').length;
              return {
                code: term.code,
                description: term.description,
                isDefault: term.isDefault,
                meta: `${termReady} ready / ${termItems.length} course(s)`,
              };
            })}
            onSelect={(code) => {
              setTermCode(code);
              setStep('list');
            }}
          />
        </div>
      )}

      {step === 'list' && (
        <div className="space-y-3">
          <div className="flow-hero">
            <p className="flow-hero__eyebrow">Release ready</p>
            <p className="flow-hero__value">
              {readyCount}
              <span className="text-base font-semibold text-slate-500"> / {items.length}</span>
            </p>
            <p className="flow-hero__caption">courses available for early viewing</p>
          </div>
          <div className="space-y-2">
            <p className="flow-section-label">Courses</p>
            {items.map((item) => {
              const ready = item.releaseReady === 'Yes';
              return (
                <FlowListCard
                  key={item.id}
                  title={`${item.subjectCode}${item.courseNumber}`}
                  subtitle={item.courseTitle}
                  meta={`Grade ${item.finalGrade} · Early ${item.isEarly}`}
                  status={ready ? 'Ready' : 'Not ready'}
                  statusTone={ready ? 'good' : 'warn'}
                  onClick={() => {
                    setItemId(item.id);
                    setStep('detail');
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {step === 'detail' && detail && (
        <div className="space-y-3">
          <div className="flow-hero">
            <p className="flow-hero__eyebrow">Release status</p>
            <p className="flow-hero__value">
              {detail.releaseReady === 'Yes' ? 'Ready' : 'Not ready'}
            </p>
            <p className="flow-hero__caption">
              {detail.subjectCode}
              {detail.courseNumber} · {detail.courseTitle}
            </p>
          </div>
          <DetailSection
            title="Grade release"
            rows={[
              { label: 'Final grade', value: detail.finalGrade },
              { label: 'Posted', value: detail.gradeDate ?? '—' },
              { label: 'CRN', value: detail.crn },
              { label: 'IS_EARLY', value: detail.isEarly },
              { label: 'IS_ENDO', value: detail.isEndo ?? '—' },
              { label: 'Final copy', value: detail.markFinalCopyInd ?? '—' },
              { label: 'Term', value: detail.termCode ?? termCode },
              { label: 'Note', value: detail.sourceNote ?? '—' },
            ]}
          />
        </div>
      )}
    </AcademicFlowShell>
  );
};
