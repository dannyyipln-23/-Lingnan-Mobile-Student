import React, { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, MapPin } from 'lucide-react';
import { AcademicFlowShell } from './AcademicFlowShell';
import { buildExamCalendarEvent, downloadCalendarEvent } from './calendarUtils';
import { DetailSection } from './DetailSection';
import { FlowListCard } from './FlowListCard';
import { TermPicker } from './TermPicker';

type FlowStep = 'term' | 'list' | 'detail';

type ExamPayload = {
  title: string;
  subtitle?: string;
  terms: Array<{
    code: string;
    description: string;
    isDefault?: boolean;
    noOfCourses?: string;
  }>;
  itemsByTerm: Record<
    string,
    Array<{
      id: string;
      courseCode: string;
      courseTitle: string;
      examDate: string;
      examDay?: string;
      examTime: string;
      beginTime: string;
      endTime: string;
      venue: string;
    }>
  >;
  detailsById: Record<
    string,
    {
      courseCode: string;
      courseTitle: string;
      termCode: string;
      termDescription?: string;
      examDate: string;
      examDay?: string;
      beginTime: string;
      endTime: string;
      venue: string;
      seatNumber: string;
      googleMap?: string;
      seatingPlanLink?: string;
      seatNotes?: string;
    }
  >;
};

interface MyExamTimetableFlowProps {
  onBack: () => void;
}

export const MyExamTimetableFlow: React.FC<MyExamTimetableFlowProps> = ({ onBack }) => {
  const [payload, setPayload] = useState<ExamPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<FlowStep>('term');
  const [termCode, setTermCode] = useState<string>('');
  const [itemId, setItemId] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    fetch('/mock/academic/my-exam-timetable.json')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load exam timetable (${res.status})`);
        }
        return res.json() as Promise<ExamPayload>;
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

  const addToCalendar = () => {
    if (!detail) {
      return;
    }
    const event = buildExamCalendarEvent({
      title: `${detail.courseCode} Exam`,
      examDate: detail.examDate,
      beginTime: detail.beginTime,
      endTime: detail.endTime,
      venue: detail.venue,
      description: detail.seatNotes,
    });
    if (event) {
      downloadCalendarEvent(event);
    }
  };

  if (error) {
    return (
      <AcademicFlowShell title="My Exam Timetable" theme="exam" onBack={onBack}>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">{error}</div>
      </AcademicFlowShell>
    );
  }

  if (!payload) {
    return (
      <AcademicFlowShell title="My Exam Timetable" theme="exam" onBack={onBack}>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500">Loading…</div>
      </AcademicFlowShell>
    );
  }

  return (
    <AcademicFlowShell
      title="My Exam Timetable"
      subtitle={
        step === 'term'
          ? payload.subtitle
          : step === 'list'
            ? selectedTerm?.description
            : detail?.courseTitle
      }
      theme="exam"
      onBack={handleBack}
      backLabel={step === 'term' ? 'Campus' : 'Back'}
    >
      {step === 'term' && (
        <TermPicker
          terms={payload.terms.map((term) => ({
            code: term.code,
            description: term.description,
            isDefault: term.isDefault,
            meta: term.noOfCourses ? `${term.noOfCourses} exam course(s)` : undefined,
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
            Exams ({items.length})
          </p>
          {items.map((item) => (
            <FlowListCard
              key={item.id}
              title={item.courseCode}
              subtitle={item.courseTitle}
              meta={`${item.examDate} · ${item.examTime}`}
              status={item.venue.split(' ').slice(0, 2).join(' ')}
              statusTone="muted"
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
          <div className="rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 to-orange-50 p-4 shadow-sm">
            <p className="text-sm font-bold text-slate-900">
              {detail.courseCode} · {detail.courseTitle}
            </p>
            <p className="text-xs text-slate-700 mt-1">
              {detail.examDate}
              {detail.examDay ? ` (${detail.examDay})` : ''}
            </p>
            <p className="text-xs text-slate-700">
              {detail.beginTime} – {detail.endTime}
            </p>
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-slate-600">
              <MapPin className="w-3.5 h-3.5" />
              <span>{detail.venue}</span>
            </div>
            <button
              type="button"
              onClick={addToCalendar}
              className="mt-3 inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-red-700"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Add to Calendar</span>
            </button>
          </div>

          <DetailSection
            title="Venue & seat"
            rows={[
              { label: 'Seat', value: detail.seatNumber },
              { label: 'Venue', value: detail.venue },
              {
                label: 'Campus map',
                value: detail.googleMap ? 'Open map' : '—',
                href: detail.googleMap,
              },
              {
                label: 'Seating plan',
                value: detail.seatingPlanLink ? 'View plan' : '—',
                href: detail.seatingPlanLink,
              },
              { label: 'Notes', value: detail.seatNotes ?? '—' },
              { label: 'Term', value: detail.termDescription ?? detail.termCode },
            ]}
          />
        </div>
      )}
    </AcademicFlowShell>
  );
};
