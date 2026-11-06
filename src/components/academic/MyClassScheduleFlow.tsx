import React, { useEffect, useMemo, useState } from 'react';
import { Clock3, MapPin } from 'lucide-react';
import { AcademicFlowShell } from './AcademicFlowShell';
import { DetailSection } from './DetailSection';
import { FlowListCard } from './FlowListCard';
import { TermPicker } from './TermPicker';
import {
  extractTerms,
  fetchRegisteredCourses,
  formatClassDateRange,
  formatMeetingDays,
  RegisteredCourse,
} from '../../lib/registeredCourses';

type FlowStep = 'term' | 'list' | 'detail';

interface MyClassScheduleFlowProps {
  onBack: () => void;
}

const stepIndexMap: Record<FlowStep, number> = { term: 0, list: 1, detail: 2 };

export const MyClassScheduleFlow: React.FC<MyClassScheduleFlowProps> = ({ onBack }) => {
  const [courses, setCourses] = useState<RegisteredCourse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<FlowStep>('term');
  const [termCode, setTermCode] = useState<string>('');
  const [itemId, setItemId] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await fetchRegisteredCourses();
        if (!cancelled) {
          setCourses(rows);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load class schedule');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const terms = useMemo(() => extractTerms(courses), [courses]);

  const selectedTerm = useMemo(
    () => terms.find((term) => term.code === termCode),
    [termCode, terms],
  );

  const items = useMemo(
    () => courses.filter((course) => course.termCode === termCode),
    [courses, termCode],
  );

  const detail = useMemo(
    () => items.find((item) => item.id === itemId),
    [itemId, items],
  );

  const courseCountByTerm = useMemo(() => {
    const counts = new Map<string, number>();
    for (const course of courses) {
      counts.set(course.termCode, (counts.get(course.termCode) ?? 0) + 1);
    }
    return counts;
  }, [courses]);

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

  if (loading) {
    return (
      <AcademicFlowShell title="My Class Schedule" theme="schedule" onBack={onBack}>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
          Loading…
        </div>
      </AcademicFlowShell>
    );
  }

  return (
    <AcademicFlowShell
      title="My Class Schedule"
      subtitle={
        step === 'term'
          ? 'Select a term, then a course for schedule details'
          : step === 'list'
            ? selectedTerm?.description
            : detail?.courseTitle
      }
      theme="schedule"
      onBack={handleBack}
      backLabel={step === 'term' ? 'Academic' : 'Back'}
      stepIndex={stepIndexMap[step]}
      stepCount={3}
    >
      {step === 'term' && (
        <TermPicker
          terms={terms.map((term) => ({
            code: term.code,
            description: term.description,
            isDefault: term.isDefault,
            meta: `${courseCountByTerm.get(term.code) ?? 0} registered course(s)`,
          }))}
          onSelect={(code) => {
            setTermCode(code);
            setStep('list');
          }}
        />
      )}

      {step === 'list' && (
        <div className="space-y-3">
          <div className="flow-hero">
            <p className="flow-hero__eyebrow">This term</p>
            <p className="flow-hero__value">
              {items.length} <span className="text-base font-semibold text-slate-500">courses</span>
            </p>
            <p className="flow-hero__caption">{selectedTerm?.description}</p>
          </div>
          <div className="space-y-2">
            <p className="flow-section-label">Registered courses</p>
            {items.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
                No registered courses for this term.
              </div>
            )}
            {items.map((item) => (
              <FlowListCard
                key={item.id}
                title={`${item.subjectCode}${item.courseNumber}`}
                subtitle={item.courseTitle}
                meta={item.scheduleType}
                onClick={() => {
                  setItemId(item.id);
                  setStep('detail');
                }}
              />
            ))}
          </div>
        </div>
      )}

      {step === 'detail' && detail && (
        <div className="space-y-3">
          <div className="flow-hero">
            <p className="flow-hero__eyebrow">
              {detail.subjectCode}
              {detail.courseNumber}
            </p>
            <p className="mt-1 text-lg font-bold tracking-tight text-slate-900">{detail.courseTitle}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600">
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-2 py-1">
                <Clock3 className="h-3 w-3" />
                {formatMeetingDays(detail.dayOfWeek)} · {detail.startTime} – {detail.endTime}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-2 py-1">
                <MapPin className="h-3 w-3" />
                {detail.location}
                {detail.room !== '—' ? ` ${detail.room}` : ''}
              </span>
            </div>
          </div>
          <DetailSection
            title="Meeting"
            rows={[
              { label: 'Days', value: formatMeetingDays(detail.dayOfWeek) },
              { label: 'Time', value: `${detail.startTime} – ${detail.endTime}` },
              { label: 'Location', value: detail.location },
              { label: 'Room', value: detail.room },
              { label: 'Faculty', value: detail.faculty },
            ]}
          />
          <DetailSection
            title="Registration"
            rows={[
              { label: 'CRN', value: detail.crn },
              { label: 'Type', value: detail.scheduleType },
              { label: 'Section', value: detail.section },
              { label: 'Status', value: detail.statusMessage },
              { label: 'Class dates', value: formatClassDateRange(detail) },
              { label: 'Term', value: detail.termCode },
            ]}
          />
        </div>
      )}
    </AcademicFlowShell>
  );
};
