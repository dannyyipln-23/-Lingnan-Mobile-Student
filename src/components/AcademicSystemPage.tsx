import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarClock, CalendarPlus, CircleAlert, MapPin } from 'lucide-react';

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
  summaryByTerm?: Record<string, SummaryItem[]>;
  sections: DetailSection[];
  sectionsByTerm?: Record<string, DetailSection[]>;
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

type TermOption = {
  code: string;
  label: string;
};

type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
};

const TERM_CODE_KEYS = ['TermCode', 'LevelTermCode', 'termCode', 'termLevelCode'];
const TERM_DESCRIPTION_KEYS = ['TermDescription', 'LevelTermDesc', 'termDescription', 'termLevelDesc'];

const normalizeTermCode = (value: string): string => value.trim().split('_')[0];

const isValidDate = (value: Date): boolean => !Number.isNaN(value.getTime());

const normalizeExamDateText = (value: string): string => value.replace(/\s*\([^)]*\)/g, '').trim();

const parseDateTime = (dateText: string, timeText: string): Date | null => {
  const parsed = new Date(`${normalizeExamDateText(dateText)} ${timeText}`);
  return isValidDate(parsed) ? parsed : null;
};

const formatIcsDateTime = (value: Date): string => {
  const year = value.getFullYear().toString().padStart(4, '0');
  const month = (value.getMonth() + 1).toString().padStart(2, '0');
  const day = value.getDate().toString().padStart(2, '0');
  const hours = value.getHours().toString().padStart(2, '0');
  const mins = value.getMinutes().toString().padStart(2, '0');
  const secs = value.getSeconds().toString().padStart(2, '0');

  return `${year}${month}${day}T${hours}${mins}${secs}`;
};

const escapeIcsText = (value: string): string => value
  .replace(/\\/g, '\\\\')
  .replace(/\n/g, '\\n')
  .replace(/,/g, '\\,')
  .replace(/;/g, '\\;');

const buildCalendarEventFromRow = (row: Record<string, string>): CalendarEvent | null => {
  const title = row.CourseTitle ?? row.CourseCode ?? row.CRN;
  if (!title) {
    return null;
  }

  const explicitStart = row.BeginTime && row.ExamDate ? parseDateTime(row.ExamDate, row.BeginTime) : null;
  const explicitEnd = row.EndTime && row.ExamDate ? parseDateTime(row.ExamDate, row.EndTime) : null;

  let start = explicitStart;
  let end = explicitEnd;

  if (!start && row.ExamDate && row.ExamTime) {
    const [rawStart, rawEnd] = row.ExamTime.split('-').map((part) => part.trim());
    if (rawStart && rawEnd) {
      start = parseDateTime(row.ExamDate, rawStart);
      end = parseDateTime(row.ExamDate, rawEnd);
    }
  }

  if (!start || !end) {
    return null;
  }

  return {
    title,
    start,
    end,
    location: row.Venue,
    description: row.CourseCode ? `Course: ${row.CourseCode}` : undefined,
  };
};

const getRowTermCode = (row: Record<string, string>): string | null => {
  for (const key of TERM_CODE_KEYS) {
    const val = row[key];
    if (typeof val === 'string' && val.trim()) {
      return val;
    }
  }

  return null;
};

const getRowTermDescription = (row: Record<string, string>): string | null => {
  for (const key of TERM_DESCRIPTION_KEYS) {
    const val = row[key];
    if (typeof val === 'string' && val.trim()) {
      return val;
    }
  }

  return null;
};

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
  const [selectedTermCode, setSelectedTermCode] = useState<string>('');
  const isTimetablePage = systemKey === 'my-class-schedule' || systemKey === 'my-exam-timetable';
  const displayedTermCode = selectedTermCode || payload?.studentContext?.termCode;

  const activeSummary = useMemo<SummaryItem[]>(() => {
    if (!payload) {
      return [];
    }

    const byTerm = payload.summaryByTerm;
    if (byTerm && selectedTermCode) {
      const normalizedSelected = normalizeTermCode(selectedTermCode);
      const matchedKey = Object.keys(byTerm).find((key) => normalizeTermCode(key) === normalizedSelected);
      if (matchedKey) {
        return byTerm[matchedKey];
      }
    }

    return payload.summary;
  }, [payload, selectedTermCode]);

  const activeSections = useMemo<DetailSection[]>(() => {
    if (!payload) {
      return [];
    }

    const byTerm = payload.sectionsByTerm;
    if (byTerm && selectedTermCode) {
      const normalizedSelected = normalizeTermCode(selectedTermCode);
      const matchedKey = Object.keys(byTerm).find((key) => normalizeTermCode(key) === normalizedSelected);
      if (matchedKey) {
        return byTerm[matchedKey];
      }
    }

    return payload.sections;
  }, [payload, selectedTermCode]);

  const downloadCalendarEvent = (event: CalendarEvent) => {
    const content = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Lingnan Mobile Student//Academic Calendar//EN',
      'BEGIN:VEVENT',
      `UID:${Date.now()}-${Math.random().toString(36).slice(2)}@lingnan-mobile-student`,
      `DTSTAMP:${formatIcsDateTime(new Date())}`,
      `DTSTART:${formatIcsDateTime(event.start)}`,
      `DTEND:${formatIcsDateTime(event.end)}`,
      `SUMMARY:${escapeIcsText(event.title)}`,
      event.location ? `LOCATION:${escapeIcsText(event.location)}` : '',
      event.description ? `DESCRIPTION:${escapeIcsText(event.description)}` : '',
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean).join('\r\n');

    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'exam'}-event.ics`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const termOptions = useMemo<TermOption[]>(() => {
    if (!payload) {
      return [];
    }

    const termMap = new Map<string, TermOption>();

    const registerTerm = (rawCode?: string, rawLabel?: string) => {
      if (!rawCode || !rawCode.trim()) {
        return;
      }

      const normalizedCode = normalizeTermCode(rawCode);
      if (!normalizedCode) {
        return;
      }

      const current = termMap.get(normalizedCode);
      const label = rawLabel && rawLabel.trim() ? rawLabel : normalizedCode;
      if (!current || current.label === current.code) {
        termMap.set(normalizedCode, { code: normalizedCode, label });
      }
    };

    registerTerm(payload.studentContext?.termCode, payload.studentContext?.termCode);
    registerTerm(payload.studentContext?.termLevelCode, payload.studentContext?.termLevelCode);

    for (const dataset of payload.datasets ?? []) {
      for (const row of dataset.rows) {
        registerTerm(getRowTermCode(row) ?? undefined, getRowTermDescription(row) ?? undefined);
      }
    }

    return Array.from(termMap.values()).sort((a, b) => b.code.localeCompare(a.code));
  }, [payload]);

  useEffect(() => {
    if (termOptions.length === 0) {
      setSelectedTermCode('');
      return;
    }

    const defaultCandidates = [
      payload?.studentContext?.termCode,
      payload?.studentContext?.termLevelCode,
    ].filter((value): value is string => Boolean(value && value.trim()));

    const matchedDefault = defaultCandidates
      .map((candidate) => normalizeTermCode(candidate))
      .find((candidate) => termOptions.some((option) => option.code === candidate));

    setSelectedTermCode(matchedDefault ?? termOptions[0].code);
  }, [payload, termOptions, systemKey]);

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
    <div className="page-shell page-shell--campus sys-page">
      <div className="sys-toolbar">
        <button
          type="button"
          onClick={onBack}
          className="sys-back"
        >
          <ArrowLeft className="sys-back__icon" />
          <span>Back to Academic</span>
        </button>
      </div>

      {loading && (
        <div className="sys-state">
          Loading page data...
        </div>
      )}

      {!!error && (
        <div className="sys-state sys-state--error">
          <CircleAlert className="sys-state__icon" />
          <span>{error}</span>
        </div>
      )}

      {!loading && payload && (
        <>
          {(!!selectedTermCode || termOptions.length > 1) && (
            <section className="sys-term">
              <div className="sys-term__row">
                <div className="sys-term__label">Viewing term</div>
                {termOptions.length > 1 && (
                  <div className="sys-term__select-wrap">
                    <select
                      id="academic-term-select"
                      value={selectedTermCode}
                      onChange={(e) => setSelectedTermCode(e.target.value)}
                      className="sys-select"
                    >
                      {termOptions.map((term) => (
                        <option key={term.code} value={term.code}>
                          {term.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="sys-panel">
            <h2 className="sys-panel__title">{payload.title}</h2>
            {payload.subtitle && (
              <p className="sys-panel__subtitle">{payload.subtitle}</p>
            )}
            <p className="sys-updated">
              <CalendarClock className="sys-updated__icon" />
              <span>Last updated: {payload.lastUpdated}</span>
            </p>

            {!!payload.studentContext && (
              <div className="sys-ctx-grid">
                {payload.studentContext.studentId && (
                  <div className="sys-ctx">
                    <span className="sys-ctx__label">Student ID</span>
                    <span className="sys-ctx__value">{payload.studentContext.studentId}</span>
                  </div>
                )}
                {payload.studentContext.userNm && (
                  <div className="sys-ctx">
                    <span className="sys-ctx__label">UserNm</span>
                    <span className="sys-ctx__value">{payload.studentContext.userNm}</span>
                  </div>
                )}
                {displayedTermCode && (
                  <div className="sys-ctx">
                    <span className="sys-ctx__label">TermCode</span>
                    <span className="sys-ctx__value">{displayedTermCode}</span>
                  </div>
                )}
                {payload.studentContext.termLevelCode && (
                  <div className="sys-ctx">
                    <span className="sys-ctx__label">TermLevelCode</span>
                    <span className="sys-ctx__value">{payload.studentContext.termLevelCode}</span>
                  </div>
                )}
              </div>
            )}

            <div className="sys-summary">
              {activeSummary.map((item) => (
                <div
                  key={item.label}
                  className="sys-summary__item"
                >
                  <span className="sys-summary__label">{item.label}</span>
                  <span className="sys-summary__value">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          {activeSections.map((section) => (
            <section key={section.title} className="sys-panel">
              <h3 className="sys-panel__section-title">{section.title}</h3>
              <div className="sys-rows">
                {section.rows.map((row) => (
                  <div key={`${section.title}-${row.label}`} className="sys-row">
                    <span className="sys-row__label">{row.label}</span>
                    <span className="sys-row__value">{row.value}</span>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {(payload.datasets ?? []).map((dataset) => {
            const shouldHideDataset =
              systemKey === 'my-graduation-requirements' &&
              (
                dataset.id === 'courses-terms' ||
                dataset.id === 'current-term-list' ||
                dataset.title.toLowerCase().includes('course terms') ||
                dataset.title.toLowerCase().includes('current term list')
              );

            if (shouldHideDataset) {
              return null;
            }

            return (
            <section key={dataset.id} className="sys-panel sys-panel--dataset">
              <div className="sys-dataset__head">
                <div>
                  <h3 className="sys-panel__section-title--flush">{dataset.title}</h3>
                  <p className="sys-dataset__purpose">{dataset.purpose}</p>
                </div>
              </div>

              {(() => {
                const filteredRows = dataset.rows.filter((row) => {
                  if (!selectedTermCode) {
                    return true;
                  }

                  const rowTermCode = getRowTermCode(row);
                  if (!rowTermCode) {
                    return true;
                  }

                  return normalizeTermCode(rowTermCode) === normalizeTermCode(selectedTermCode);
                });

                const scheduleEvents = filteredRows
                  .map((row) => ({
                    row,
                    event: buildCalendarEventFromRow(row),
                  }))
                  .filter((item): item is { row: Record<string, string>; event: CalendarEvent } => item.event !== null);

                return (
              <>
              {isTimetablePage && scheduleEvents.length > 0 && (
                <div className="sys-events">
                  {scheduleEvents.map(({ row, event }, idx) => (
                    <article key={`${dataset.id}-schedule-${idx}`} className="sys-event">
                      <div className="sys-event__top">
                        <div>
                          <p className="sys-event__title">{event.title}</p>
                          <p className="sys-event__when">
                            {row.ExamDate ?? '-'}
                            {row.ExamTime ? `, ${row.ExamTime}` : ''}
                            {!row.ExamTime && row.BeginTime && row.EndTime ? `, ${row.BeginTime} - ${row.EndTime}` : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => downloadCalendarEvent(event)}
                          className="sys-cal-btn"
                        >
                          <CalendarPlus className="sys-cal-btn__icon" />
                          <span>Add to Calendar</span>
                        </button>
                      </div>
                      {row.Venue && (
                        <div className="sys-venue">
                          <MapPin className="sys-venue__icon" />
                          <span>{row.Venue}</span>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}

              <div className="sys-table-wrap">
                <table className="sys-table">
                  <thead className="sys-table__head">
                    <tr>
                      {dataset.columns.map((column) => (
                        <th key={`${dataset.id}-${column}`} className="sys-th">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.length === 0 && (
                      <tr className="sys-tr">
                        <td className="sys-td sys-td--empty" colSpan={dataset.columns.length}>
                          No records for the selected term.
                        </td>
                      </tr>
                    )}
                    {filteredRows.map((row, idx) => (
                      <tr key={`${dataset.id}-row-${idx}`} className="sys-tr">
                        {dataset.columns.map((column) => (
                          <td key={`${dataset.id}-row-${idx}-${column}`} className="sys-td">
                            {row[column] ?? '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
                );
              })()}
            </section>
            );
          })}
        </>
      )}
    </div>
  );
};
