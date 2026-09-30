import React, { useEffect, useMemo, useState } from 'react';
import { AcademicFlowShell } from './AcademicFlowShell';
import { DetailSection } from './DetailSection';
import { FlowListCard } from './FlowListCard';
import { TermPicker } from './TermPicker';

type FlowStep = 'term' | 'list' | 'detail';

type ResultsPayload = {
  title: string;
  subtitle?: string;
  overview?: {
    cgpa?: string;
    creditsEarned?: string;
    creditsInProgress?: string;
  };
  terms: Array<{
    code: string;
    termCode?: string;
    description: string;
    isDefault?: boolean;
  }>;
  itemsByTerm: Record<
    string,
    Array<{
      id: string;
      subjectCode: string;
      courseNumber: string;
      courseTitle: string;
      finalGrade: string;
      crn: string;
    }>
  >;
  detailsById: Record<
    string,
    {
      subjectCode: string;
      courseNumber: string;
      courseTitle: string;
      crn: string;
      section?: string;
      subjectType?: string;
      midGrade?: string;
      finalGrade: string;
      gradeDate?: string;
      termCode?: string;
      termLevelCode?: string;
    }
  >;
};

interface MyAcademicResultsFlowProps {
  onBack: () => void;
}

const stepIndexMap: Record<FlowStep, number> = { term: 0, list: 1, detail: 2 };

export const MyAcademicResultsFlow: React.FC<MyAcademicResultsFlowProps> = ({ onBack }) => {
  const [payload, setPayload] = useState<ResultsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<FlowStep>('term');
  const [termCode, setTermCode] = useState<string>('');
  const [itemId, setItemId] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    fetch('/mock/academic/my-academic-results.json')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load academic results (${res.status})`);
        }
        return res.json() as Promise<ResultsPayload>;
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
      <AcademicFlowShell title="My Academic Results" theme="results" onBack={onBack}>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">{error}</div>
      </AcademicFlowShell>
    );
  }

  if (!payload) {
    return (
      <AcademicFlowShell title="My Academic Results" theme="results" onBack={onBack}>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500">Loading…</div>
      </AcademicFlowShell>
    );
  }

  const subtitle =
    step === 'term'
      ? payload.subtitle
      : step === 'list'
        ? selectedTerm?.description
        : `${detail?.subjectCode ?? ''}${detail?.courseNumber ?? ''}`;

  return (
    <AcademicFlowShell
      title="My Academic Results"
      subtitle={subtitle}
      theme="results"
      onBack={handleBack}
      backLabel={step === 'term' ? 'Campus' : 'Back'}
      stepIndex={stepIndexMap[step]}
      stepCount={3}
    >
      {step === 'term' && (
        <div className="space-y-3">
          {payload.overview && (
            <div className="flow-hero">
              <p className="flow-hero__eyebrow">Cumulative overview</p>
              <p className="flow-hero__value">{payload.overview.cgpa ?? '—'}</p>
              <p className="flow-hero__caption">cGPA across all terms</p>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-blue-100 pt-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Earned</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-900">
                    {payload.overview.creditsEarned ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    In progress
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-slate-900">
                    {payload.overview.creditsInProgress ?? '—'}
                  </p>
                </div>
              </div>
            </div>
          )}
          <TermPicker
            terms={payload.terms.map((term) => ({
              code: term.code,
              description: term.description,
              isDefault: term.isDefault,
            }))}
            onSelect={(code) => {
              setTermCode(code);
              setStep('list');
            }}
          />
        </div>
      )}

      {step === 'list' && (
        <div className="space-y-2">
          <p className="flow-section-label">Courses ({items.length})</p>
          {items.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
              No grades for this term.
            </div>
          )}
          {items.map((item) => (
            <FlowListCard
              key={item.id}
              title={`${item.subjectCode}${item.courseNumber}`}
              subtitle={item.courseTitle}
              meta={`CRN ${item.crn}`}
              status={item.finalGrade}
              statusTone="good"
              onClick={() => {
                setItemId(item.id);
                setStep('detail');
              }}
            />
          ))}
        </div>
      )}

      {step === 'detail' && detail && (
        <div className="space-y-3">
          <div className="flow-hero">
            <p className="flow-hero__eyebrow">Final grade</p>
            <p className="flow-hero__value">{detail.finalGrade}</p>
            <p className="flow-hero__caption">
              {detail.subjectCode}
              {detail.courseNumber} · {detail.courseTitle}
            </p>
          </div>
          <DetailSection
            title="Grade details"
            rows={[
              { label: 'Mid-term', value: detail.midGrade ?? '—' },
              { label: 'Final', value: detail.finalGrade },
              { label: 'Posted', value: detail.gradeDate ?? '—' },
              { label: 'CRN', value: detail.crn },
              { label: 'Section', value: detail.section ?? '—' },
              { label: 'Type', value: detail.subjectType ?? '—' },
              { label: 'Term', value: detail.termCode ?? selectedTerm?.termCode ?? termCode },
            ]}
          />
        </div>
      )}
    </AcademicFlowShell>
  );
};
