import React, { useEffect, useMemo, useState } from 'react';
import { Clock3, MapPin } from 'lucide-react';
import { AcademicFlowShell } from './AcademicFlowShell';
import { DetailSection } from './DetailSection';
import { FlowListCard } from './FlowListCard';
import { TermPicker } from './TermPicker';
import {
  extractTerms,
  formatClassDateRange,
  formatMeetingDays,
  formatVenue,
  RegisteredCourse,
} from '../../lib/registeredCourses';
import { fetchRegisteredCoursesWithMeetings } from '../../lib/registeredCourseMeetings';

type FlowStep = 'term' | 'list' | 'detail';

interface MyClassScheduleFlowProps {
  onBack: () => void;
}

const stepIndexMap: Record<FlowStep, number> = { term: 0, list: 1, detail: 2 };

const scheduleTypeStyle = (
  scheduleType: string,
): { accent: string; chipClass: string } => {
  const normalized = scheduleType.trim().toLowerCase();
  if (normalized === 'lecture') {
    return { accent: '#2563EB', chipClass: 'sched-type sched-type--lecture' };
  }
  if (normalized === 'tutorial') {
    return { accent: '#D97706', chipClass: 'sched-type sched-type--tutorial' };
  }
  return { accent: '#64748B', chipClass: 'sched-type sched-type--default' };
};

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
        const rows = await fetchRegisteredCoursesWithMeetings();
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
        <div className="flow-state flow-state--error">{error}</div>
      </AcademicFlowShell>
    );
  }

  if (loading) {
    return (
      <AcademicFlowShell title="My Class Schedule" theme="schedule" onBack={onBack}>
        <div className="flow-state">Loading…</div>
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
              {items.length} <span className="flow-hero__unit">courses</span>
            </p>
            <p className="flow-hero__caption">{selectedTerm?.description}</p>
          </div>
          <div className="space-y-2">
            <p className="flow-section-label">Registered courses</p>
            {items.length === 0 && (
              <div className="flow-state">No registered courses for this term.</div>
            )}
            {items.map((item) => {
              const typeStyle = scheduleTypeStyle(item.scheduleType);
              return (
                <FlowListCard
                  key={item.id}
                  title={`${item.subjectCode}${item.courseNumber}`}
                  subtitle={item.courseTitle}
                  status={item.scheduleType}
                  statusClassName={typeStyle.chipClass}
                  accent={typeStyle.accent}
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
            <div className="flow-hero__chips">
              <p className="flow-hero__eyebrow">
                {detail.subjectCode}
                {detail.courseNumber}
              </p>
              <span className={scheduleTypeStyle(detail.scheduleType).chipClass}>
                {detail.scheduleType}
              </span>
            </div>
            <p className="flow-hero__title">{detail.courseTitle}</p>
            <div className="flow-hero__meta">
              <span className="flow-meta-chip">
                <Clock3 className="h-3 w-3" />
                {formatMeetingDays(detail.meetingDays ?? detail.dayOfWeek)} · {detail.startTime} –{' '}
                {detail.endTime}
              </span>
              <span className="flow-meta-chip">
                <MapPin className="h-3 w-3" />
                {formatVenue(detail)}
              </span>
            </div>
          </div>
          <DetailSection
            title="Meeting"
            rows={[
              {
                label: 'Days',
                value: formatMeetingDays(detail.meetingDays ?? detail.dayOfWeek),
              },
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
              { label: 'Class dates', value: formatClassDateRange(detail) },
              { label: 'Term', value: detail.termCode },
            ]}
          />
        </div>
      )}
    </AcademicFlowShell>
  );
};
