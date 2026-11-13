import React, { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, MapPin } from 'lucide-react';
import { AcademicFlowShell } from './AcademicFlowShell';
import { buildExamCalendarEvent, downloadCalendarEvent } from './calendarUtils';
import { DetailSection } from './DetailSection';
import { FlowListCard } from './FlowListCard';
import { TermPicker } from './TermPicker';
import { decodeXmlText, fetchDataRecordXml } from '../../lib/parseDataRecordXml';

type FlowStep = 'term' | 'list' | 'detail';

type ExamSummaryRow = {
  STUDENTID: string;
  USERNM: string;
  TERMCODE: string;
  TERMDESCRIPTION: string;
  NOOFCOURSES: string;
};

type ExamScheduleRow = {
  USERNM: string;
  TERMCODE: string;
  TERMDESCRIPTION: string;
  COURSECODE: string;
  COURSETITLE: string;
  EXAMDATE: string;
  EXAMDAY: string;
  BEGINTIME: string;
  ENDTIME: string;
  VENUE: string;
  SEATNUMBER: string;
  GOOGLEMAP: string;
  SEATINGPLANLINK: string;
  SEATNOTES: string;
};

type ExamItem = {
  id: string;
  courseCode: string;
  courseTitle: string;
  examDate: string;
  examDay: string;
  examTime: string;
  beginTime: string;
  endTime: string;
  venue: string;
  seatNumber: string;
  googleMap?: string;
  seatingPlanLink?: string;
  seatNotes?: string;
  termCode: string;
  termDescription: string;
};

interface MyExamTimetableFlowProps {
  onBack: () => void;
}

const stepIndexMap: Record<FlowStep, number> = { term: 0, list: 1, detail: 2 };

const normalizeSeat = (value: string): string => {
  const cleaned = value.trim();
  if (!cleaned || /^-+$/.test(cleaned)) return '—';
  return cleaned;
};

const optionalLink = (value: string): string | undefined => {
  const cleaned = decodeXmlText(value);
  return cleaned || undefined;
};

export const MyExamTimetableFlow: React.FC<MyExamTimetableFlowProps> = ({ onBack }) => {
  const [summaries, setSummaries] = useState<ExamSummaryRow[]>([]);
  const [schedules, setSchedules] = useState<ExamScheduleRow[]>([]);
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
        const [summaryRows, scheduleRows] = await Promise.all([
          fetchDataRecordXml<ExamSummaryRow>('/mock/academic/student_exam_summary.xml', [
            'STUDENTID',
            'USERNM',
            'TERMCODE',
            'TERMDESCRIPTION',
            'NOOFCOURSES',
          ]),
          fetchDataRecordXml<ExamScheduleRow>('/mock/academic/student_exam_schedule.xml', [
            'USERNM',
            'TERMCODE',
            'TERMDESCRIPTION',
            'COURSECODE',
            'COURSETITLE',
            'EXAMDATE',
            'EXAMDAY',
            'BEGINTIME',
            'ENDTIME',
            'VENUE',
            'SEATNUMBER',
            'GOOGLEMAP',
            'SEATINGPLANLINK',
            'SEATNOTES',
          ]),
        ]);

        if (cancelled) return;
        setSummaries(summaryRows);
        setSchedules(scheduleRows);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load exam timetable');
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

  const terms = useMemo(() => {
    const byCode = new Map<
      string,
      { code: string; description: string; noOfCourses?: string; isDefault?: boolean }
    >();

    for (const row of summaries) {
      const code = row.TERMCODE.trim();
      if (!code || byCode.has(code)) continue;
      byCode.set(code, {
        code,
        description: decodeXmlText(row.TERMDESCRIPTION),
        noOfCourses: row.NOOFCOURSES.trim() || undefined,
      });
    }

    for (const row of schedules) {
      const code = row.TERMCODE.trim();
      if (!code || byCode.has(code)) continue;
      byCode.set(code, {
        code,
        description: decodeXmlText(row.TERMDESCRIPTION),
      });
    }

    const list = Array.from(byCode.values()).sort((a, b) => b.code.localeCompare(a.code));
    if (list[0]) {
      list[0] = { ...list[0], isDefault: true };
    }
    return list;
  }, [schedules, summaries]);

  const selectedTerm = useMemo(
    () => terms.find((term) => term.code === termCode),
    [termCode, terms],
  );

  const items = useMemo<ExamItem[]>(() => {
    if (!termCode) return [];
    return schedules
      .filter((row) => row.TERMCODE.trim() === termCode)
      .map((row, index) => {
        const courseCode = row.COURSECODE.trim();
        const beginTime = row.BEGINTIME.trim();
        const endTime = row.ENDTIME.trim();
        return {
          id: `${row.TERMCODE.trim()}-${courseCode || index}`,
          courseCode: courseCode || '—',
          courseTitle: decodeXmlText(row.COURSETITLE) || '—',
          examDate: decodeXmlText(row.EXAMDATE) || '—',
          examDay: row.EXAMDAY.trim(),
          examTime: beginTime && endTime ? `${beginTime} - ${endTime}` : beginTime || endTime || '—',
          beginTime: beginTime || '—',
          endTime: endTime || '—',
          venue: decodeXmlText(row.VENUE) || '—',
          seatNumber: normalizeSeat(row.SEATNUMBER),
          googleMap: optionalLink(row.GOOGLEMAP),
          seatingPlanLink: optionalLink(row.SEATINGPLANLINK),
          seatNotes: decodeXmlText(row.SEATNOTES) || undefined,
          termCode: row.TERMCODE.trim(),
          termDescription: decodeXmlText(row.TERMDESCRIPTION),
        };
      });
  }, [schedules, termCode]);

  const detail = useMemo(
    () => items.find((item) => item.id === itemId),
    [itemId, items],
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

  const addToCalendar = () => {
    if (!detail) return;
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
        <div className="flow-state flow-state--error">{error}</div>
      </AcademicFlowShell>
    );
  }

  if (loading) {
    return (
      <AcademicFlowShell title="My Exam Timetable" theme="exam" onBack={onBack}>
        <div className="flow-state">Loading…</div>
      </AcademicFlowShell>
    );
  }

  const examDateLabel =
    detail &&
    (detail.examDay && !detail.examDate.includes(`(${detail.examDay})`)
      ? `${detail.examDate} (${detail.examDay})`
      : detail.examDate);

  return (
    <AcademicFlowShell
      title="My Exam Timetable"
      subtitle={
        step === 'term'
          ? 'Select a term, then an exam for venue and seat details'
          : step === 'list'
            ? selectedTerm?.description
            : detail?.courseTitle
      }
      theme="exam"
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
            meta: term.noOfCourses
              ? `${term.noOfCourses} exam course(s)`
              : `${schedules.filter((row) => row.TERMCODE.trim() === term.code).length} exam course(s)`,
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
            <p className="flow-hero__eyebrow">Exam season</p>
            <p className="flow-hero__value">
              {items.length} <span className="flow-hero__unit">papers</span>
            </p>
            <p className="flow-hero__caption">{selectedTerm?.description}</p>
          </div>
          <div className="space-y-2">
            <p className="flow-section-label">Upcoming exams</p>
            {items.length === 0 && <div className="flow-state">No exams for this term.</div>}
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
        </div>
      )}

      {step === 'detail' && detail && (
        <div className="space-y-3">
          <div className="flow-hero">
            <div className="flow-hero__top">
              <div className="min-w-0">
                <p className="flow-hero__eyebrow">{detail.courseCode}</p>
                <p className="flow-hero__title">{detail.courseTitle}</p>
              </div>
              <button type="button" onClick={addToCalendar} className="exam-cal-btn">
                <CalendarPlus className="h-3.5 w-3.5" />
                <span>Add to Calendar</span>
              </button>
            </div>
            <p className="flow-hero__date">{examDateLabel}</p>
            <p className="flow-hero__time">
              {detail.beginTime} – {detail.endTime}
            </p>
            <div className="flow-hero__venue">
              <MapPin className="h-3.5 w-3.5" />
              <span>{detail.venue}</span>
            </div>
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
              { label: 'SeatNotes', value: detail.seatNotes ?? '—' },
              { label: 'Term', value: detail.termDescription || detail.termCode },
            ]}
          />
        </div>
      )}
    </AcademicFlowShell>
  );
};
