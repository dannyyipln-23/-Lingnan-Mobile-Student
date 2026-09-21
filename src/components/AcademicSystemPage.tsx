import React, { useEffect, useState } from 'react';
import { ArrowLeft, CalendarClock, CircleAlert } from 'lucide-react';

export type AcademicSystemKey =
  | 'my-academic-results'
  | 'my-graduation-requirements'
  | 'my-class-schedule'
  | 'my-exam-timetable'
  | 'student-graduation-information'
  | 'early-grade-release';

type SummaryItem = {
  label: string;
  value: string;
};

type SectionRow = {
  label: string;
  value: string;
};

type DetailSection = {
  title: string;
  rows: SectionRow[];
};

type AcademicPagePayload = {
  title: string;
  lastUpdated: string;
  summary: SummaryItem[];
  sections: DetailSection[];
};

interface AcademicSystemPageProps {
  systemKey: AcademicSystemKey;
  onBack: () => void;
}

const fileMap: Record<AcademicSystemKey, string> = {
  'my-academic-results': '/mock/academic/my-academic-results.json',
  'my-graduation-requirements': '/mock/academic/my-graduation-requirements.json',
  'my-class-schedule': '/mock/academic/my-class-schedule.json',
  'my-exam-timetable': '/mock/academic/my-exam-timetable.json',
  'student-graduation-information': '/mock/academic/student-graduation-information.json',
  'early-grade-release': '/mock/academic/early-grade-release.json',
};

export const AcademicSystemPage: React.FC<AcademicSystemPageProps> = ({ systemKey, onBack }) => {
  const [payload, setPayload] = useState<AcademicPagePayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch(fileMap[systemKey]);
        if (!res.ok) {
          throw new Error('Failed to fetch page JSON');
        }

        const json = (await res.json()) as AcademicPagePayload;
        if (!cancelled) {
          setPayload(json);
        }
      } catch {
        if (!cancelled) {
          setError('Unable to load this page data. Please verify the JSON file.');
          setPayload(null);
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
  }, [systemKey]);

  return (
    <div className="space-y-4 pb-24 text-slate-800">
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-red-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Campus</span>
        </button>
      </div>

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
          Loading page data...
        </div>
      )}

      {!!error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 inline-flex items-center space-x-2">
          <CircleAlert className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {!loading && payload && (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">{payload.title}</h2>
            <p className="text-xs text-slate-500 mt-1 inline-flex items-center space-x-1">
              <CalendarClock className="w-3.5 h-3.5" />
              <span>Last updated: {payload.lastUpdated}</span>
            </p>

            <div className="grid grid-cols-1 gap-2 mt-3">
              {payload.summary.map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs flex items-center justify-between">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="font-bold text-slate-800 text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          {payload.sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-2">{section.title}</h3>
              <div className="space-y-2">
                {section.rows.map((row) => (
                  <div key={`${section.title}-${row.label}`} className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs flex items-start justify-between space-x-3">
                    <span className="text-slate-600">{row.label}</span>
                    <span className="font-semibold text-slate-800 text-right">{row.value}</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
};
