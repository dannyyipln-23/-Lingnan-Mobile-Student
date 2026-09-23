import React, { useEffect, useState } from 'react';
import { ArrowLeft, CalendarClock, CircleAlert } from 'lucide-react';

export type AcademicSystemKey =
  | 'academic-record-application-system'
  | 'degree-works'
  | 'degree-works-student-information-dashboard'
  | 'accessing-ctle-scores'
  | 'elgr-extension-system'
  | 'my-academic-results'
  | 'my-graduation-requirements'
  | 'my-class-schedule'
  | 'my-exam-timetable'
  | 'student-graduation-information'
  | 'early-grade-release';

type SummaryItem = {
  label: string;
  value: string;
  tone?: 'default' | 'good' | 'warn';
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
  subtitle?: string;
  lastUpdated: string;
  studentContext?: {
    studentId?: string;
    userNm?: string;
    termCode?: string;
    termLevelCode?: string;
  };
  summary: SummaryItem[];
  sections: DetailSection[];
  datasets?: Array<{
    id: string;
    title: string;
    endpoint: string;
    purpose: string;
    filters: string[];
    columns: string[];
    rows: Array<Record<string, string>>;
  }>;
};

interface AcademicSystemPageProps {
  systemKey: AcademicSystemKey;
  onBack: () => void;
}

const fileMap: Record<AcademicSystemKey, string> = {
  'academic-record-application-system': '/mock/academic/academic-record-application-system.json',
  'degree-works': '/mock/academic/degree-works.json',
  'degree-works-student-information-dashboard': '/mock/academic/degree-works-student-information-dashboard.json',
  'accessing-ctle-scores': '/mock/academic/accessing-ctle-scores.json',
  'elgr-extension-system': '/mock/academic/elgr-extension-system.json',
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
            {payload.subtitle && (
              <p className="text-xs text-slate-500 mt-1">{payload.subtitle}</p>
            )}
            <p className="text-xs text-slate-500 mt-1 inline-flex items-center space-x-1">
              <CalendarClock className="w-3.5 h-3.5" />
              <span>Last updated: {payload.lastUpdated}</span>
            </p>

            {!!payload.studentContext && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                {payload.studentContext.studentId && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-[11px]">
                    <span className="text-slate-500 block">Student ID</span>
                    <span className="font-bold text-slate-800">{payload.studentContext.studentId}</span>
                  </div>
                )}
                {payload.studentContext.userNm && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-[11px]">
                    <span className="text-slate-500 block">UserNm</span>
                    <span className="font-bold text-slate-800">{payload.studentContext.userNm}</span>
                  </div>
                )}
                {payload.studentContext.termCode && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-[11px]">
                    <span className="text-slate-500 block">TermCode</span>
                    <span className="font-bold text-slate-800">{payload.studentContext.termCode}</span>
                  </div>
                )}
                {payload.studentContext.termLevelCode && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-[11px]">
                    <span className="text-slate-500 block">TermLevelCode</span>
                    <span className="font-bold text-slate-800">{payload.studentContext.termLevelCode}</span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 mt-3">
              {payload.summary.map((item) => (
                <div
                  key={item.label}
                  className={`rounded-xl border p-2.5 text-xs flex items-center justify-between ${
                    item.tone === 'good'
                      ? 'border-emerald-200 bg-emerald-50'
                      : item.tone === 'warn'
                        ? 'border-amber-200 bg-amber-50'
                        : 'border-slate-200 bg-slate-50'
                  }`}
                >
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

          {(payload.datasets ?? []).map((dataset) => (
            <section key={dataset.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{dataset.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{dataset.purpose}</p>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="min-w-full text-[11px]">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      {dataset.columns.map((column) => (
                        <th key={`${dataset.id}-${column}`} className="text-left px-2 py-1.5 font-bold whitespace-nowrap border-b border-slate-200">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataset.rows.map((row, idx) => (
                      <tr key={`${dataset.id}-row-${idx}`} className="bg-white even:bg-slate-50/60">
                        {dataset.columns.map((column) => (
                          <td key={`${dataset.id}-row-${idx}-${column}`} className="px-2 py-1.5 text-slate-700 whitespace-nowrap border-t border-slate-100">
                            {row[column] ?? '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
};
