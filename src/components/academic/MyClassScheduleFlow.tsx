import React, { useEffect, useMemo, useState } from 'react';
import { AcademicFlowShell } from './AcademicFlowShell';
import { DetailSection } from './DetailSection';
import { FlowListCard } from './FlowListCard';
import { TermPicker } from './TermPicker';

type FlowStep = 'term' | 'list' | 'detail';

type SchedulePayload = {
  title: string;
  subtitle?: string;
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
      courseNumber: string;
      subjectCode: string;
      courseTitle: string;
      credits: string;
      scheduleType: string;
      registrationStatusCode: string;
    }>
  >;
  detailsById: Record<
    string,
    {
      crn: string;
      subjectCode: string;
      courseNumber: string;
      courseTitle: string;
      credits: string;
      scheduleType: string;
      registrationStatusCode: string;
      faculty?: string;
      days?: string;
      daysDisplay?: string;
      startTime?: string;
      endTime?: string;
      building?: string;
      room?: string;
      classStartDate?: string;
      classEndDate?: string;
      termCode?: string;
    }
  >;
};

interface MyClassScheduleFlowProps {
  onBack: () => void;
}

export const MyClassScheduleFlow: React.FC<MyClassScheduleFlowProps> = ({ onBack }) => {
  const [payload, setPayload] = useState<SchedulePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<FlowStep>('term');
  const [termCode, setTermCode] = useState<string>('');
  const [itemId, setItemId] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    fetch('/mock/academic/my-class-schedule.json')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load class schedule (${res.status})`);
        }
        return res.json() as Promise<SchedulePayload>;
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

  const totalCredits = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.credits) || 0), 0),
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
      <AcademicFlowShell title="My Class Schedule" theme="schedule" onBack={onBack}>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">{error}</div>
      </AcademicFlowShell>
    );
  }

  if (!payload) {
    return (
      <AcademicFlowShell title="My Class Schedule" theme="schedule" onBack={onBack}>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500">Loading…</div>
      </AcademicFlowShell>
    );
  }

  return (
    <AcademicFlowShell
      title="My Class Schedule"
      subtitle={
        step === 'term'
          ? payload.subtitle
          : step === 'list'
            ? `${selectedTerm?.description ?? ''} · ${totalCredits} credits`
            : detail?.courseTitle
      }
      theme="schedule"
      onBack={handleBack}
      backLabel={step === 'term' ? 'Campus' : 'Back'}
    >
      {step === 'term' && (
        <TermPicker
          terms={payload.terms.map((term) => ({
            code: term.code,
            description: term.description,
            isDefault: term.isDefault,
            meta: `${payload.itemsByTerm[term.code]?.length ?? 0} registered course(s)`,
          }))}
          onSelect={(code) => {
            setTermCode(code);
            setStep('list');
          }}
        />
      )}

      {step === 'list' && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-0.5">
            Registered courses ({items.length})
          </p>
          {items.map((item) => (
            <FlowListCard
              key={item.id}
              title={`${item.subjectCode}${item.courseNumber}`}
              subtitle={item.courseTitle}
              meta={`${item.credits} credits · ${item.scheduleType}`}
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
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-bold text-slate-900">
              {detail.subjectCode}
              {detail.courseNumber}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">{detail.courseTitle}</p>
            <p className="text-[11px] text-slate-500 mt-2">
              {detail.days ?? '—'} · {detail.startTime ?? '—'} – {detail.endTime ?? '—'}
            </p>
          </div>
          <DetailSection
            title="Meeting"
            rows={[
              { label: 'Days', value: detail.days ?? '—' },
              { label: 'Time', value: `${detail.startTime ?? '—'} – ${detail.endTime ?? '—'}` },
              { label: 'Building', value: detail.building ?? '—' },
              { label: 'Room', value: detail.room ?? '—' },
              { label: 'Faculty', value: detail.faculty ?? '—' },
            ]}
          />
          <DetailSection
            title="Registration"
            rows={[
              { label: 'CRN', value: detail.crn },
              { label: 'Credits', value: detail.credits },
              { label: 'Type', value: detail.scheduleType },
              { label: 'Class dates', value: `${detail.classStartDate ?? '—'} → ${detail.classEndDate ?? '—'}` },
              { label: 'Term', value: detail.termCode ?? termCode },
            ]}
          />
        </div>
      )}
    </AcademicFlowShell>
  );
};
