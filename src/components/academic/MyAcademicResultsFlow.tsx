import React, { useEffect, useMemo, useState } from 'react';
import { AcademicFlowShell } from './AcademicFlowShell';
import { DetailSection } from './DetailSection';
import { FlowListCard } from './FlowListCard';
import { TermPicker } from './TermPicker';
import { fetchDataRecordXml } from '../../lib/parseDataRecordXml';

type FlowStep = 'term' | 'list' | 'detail';

type GradeTermRow = {
  STUDENTID: string;
  LEVELTERMCODE: string;
  LEVELTERMDESC: string;
};

type GradeRow = {
  STUDENTID: string;
  TERMCODE: string;
  COURSEREGISTRATIONNUMBER: string;
  SUBJECTCODE: string;
  COURSENUMBER: string;
  COURSETITLE: string;
  SUBJECTTYPE: string;
  SECTION: string;
  MIDGRADE: string;
  FINALGRADE: string;
  GRADEDATE: string;
  TERMLEVELCODE: string;
};

type GradeItem = {
  id: string;
  subjectCode: string;
  courseNumber: string;
  courseTitle: string;
  finalGrade: string;
  midGrade: string;
  crn: string;
  section: string;
  subjectType: string;
  gradeDate: string;
  termCode: string;
  termLevelCode: string;
};

interface MyAcademicResultsFlowProps {
  onBack: () => void;
}

const stepIndexMap: Record<FlowStep, number> = { term: 0, list: 1, detail: 2 };

const cleanGrade = (value: string): string => {
  const cleaned = value
    .replace(/^Grade:\s*/i, '')
    .replace(/&nbsp;/gi, '')
    .replace(/\u00a0/g, '')
    .trim();
  return cleaned || '—';
};

const decodeTitle = (value: string): string =>
  value
    .replace(/&#38;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/gi, ' ')
    .trim();

const isTermGpaRow = (row: GradeRow): boolean =>
  row.SUBJECTCODE.trim().toLowerCase() === 'term';

const parseTermGpa = (row: GradeRow): string | null => {
  if (!isTermGpaRow(row)) return null;
  const match = decodeTitle(row.COURSETITLE).match(/GPA:\s*([0-9]+(?:\.[0-9]+)?)/i);
  return match?.[1] ?? null;
};

const sortTermCodesDesc = (a: string, b: string): number => b.localeCompare(a);

export const MyAcademicResultsFlow: React.FC<MyAcademicResultsFlowProps> = ({ onBack }) => {
  const [terms, setTerms] = useState<GradeTermRow[]>([]);
  const [grades, setGrades] = useState<GradeRow[]>([]);
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
        const [termRows, gradeRows] = await Promise.all([
          fetchDataRecordXml<GradeTermRow>('/mock/academic/grade-term.xml', [
            'STUDENTID',
            'LEVELTERMCODE',
            'LEVELTERMDESC',
          ]),
          fetchDataRecordXml<GradeRow>('/mock/academic/grades.xml', [
            'STUDENTID',
            'TERMCODE',
            'COURSEREGISTRATIONNUMBER',
            'SUBJECTCODE',
            'COURSENUMBER',
            'COURSETITLE',
            'SUBJECTTYPE',
            'SECTION',
            'MIDGRADE',
            'FINALGRADE',
            'GRADEDATE',
            'TERMLEVELCODE',
          ]),
        ]);

        if (cancelled) return;

        const sortedTerms = [...termRows].sort((a, b) =>
          sortTermCodesDesc(a.LEVELTERMCODE, b.LEVELTERMCODE),
        );
        setTerms(sortedTerms);
        setGrades(gradeRows);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load academic results');
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

  const termGpaByLevel = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of grades) {
      const gpa = parseTermGpa(row);
      if (gpa) {
        map.set(row.TERMLEVELCODE, gpa);
      }
    }
    return map;
  }, [grades]);

  const pickerTerms = useMemo(
    () =>
      terms.map((term, index) => {
        const gpa = termGpaByLevel.get(term.LEVELTERMCODE);
        return {
          code: term.LEVELTERMCODE,
          description: term.LEVELTERMDESC.trim(),
          meta: gpa ? `Term GPA ${gpa}` : term.LEVELTERMCODE,
          isDefault: index === 0,
        };
      }),
    [termGpaByLevel, terms],
  );

  const selectedTerm = useMemo(
    () => terms.find((term) => term.LEVELTERMCODE === termCode),
    [termCode, terms],
  );

  const termGpa = termCode ? termGpaByLevel.get(termCode) : undefined;

  const items = useMemo<GradeItem[]>(() => {
    if (!termCode) return [];
    return grades
      .filter((row) => row.TERMLEVELCODE === termCode && !isTermGpaRow(row))
      .map((row, index) => ({
        id: `${row.TERMLEVELCODE}-${row.SUBJECTCODE}-${row.COURSENUMBER}-${row.COURSEREGISTRATIONNUMBER || index}`,
        subjectCode: row.SUBJECTCODE,
        courseNumber: row.COURSENUMBER,
        courseTitle: decodeTitle(row.COURSETITLE),
        finalGrade: cleanGrade(row.FINALGRADE),
        midGrade: cleanGrade(row.MIDGRADE),
        crn: row.COURSEREGISTRATIONNUMBER || '—',
        section: row.SECTION || '—',
        subjectType: row.SUBJECTTYPE || '—',
        gradeDate: row.GRADEDATE || '—',
        termCode: row.TERMCODE,
        termLevelCode: row.TERMLEVELCODE,
      }));
  }, [grades, termCode]);

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

  if (error) {
    return (
      <AcademicFlowShell title="My Academic Results" theme="results" onBack={onBack}>
        <div className="flow-state flow-state--error">{error}</div>
      </AcademicFlowShell>
    );
  }

  if (loading) {
    return (
      <AcademicFlowShell title="My Academic Results" theme="results" onBack={onBack}>
        <div className="flow-state">Loading…</div>
      </AcademicFlowShell>
    );
  }

  const subtitle =
    step === 'term'
      ? 'Select a term to view grades'
      : step === 'list'
        ? selectedTerm?.LEVELTERMDESC.trim()
        : `${detail?.subjectCode ?? ''}${detail?.courseNumber ?? ''}`;

  return (
    <AcademicFlowShell
      title="My Academic Results"
      subtitle={subtitle}
      theme="results"
      onBack={handleBack}
      backLabel={step === 'term' ? 'Academic' : 'Back'}
      stepIndex={stepIndexMap[step]}
      stepCount={3}
    >
      {step === 'term' && (
        <div className="space-y-3">
          {/* <div className="flow-hero">
            <p className="flow-hero__eyebrow">Academic results</p>
            <p className="mt-1 text-lg font-bold tracking-tight text-slate-900">
              Choose a term first
            </p>
          </div> */}
          <TermPicker
            terms={pickerTerms}
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
            <p className="flow-hero__eyebrow">Term GPA</p>
            <p className="flow-hero__value">{termGpa ?? '—'}</p>
            <p className="flow-hero__caption">
              {selectedTerm?.LEVELTERMDESC.trim()} · {items.length} course
              {items.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="space-y-2">
            <p className="flow-section-label">Courses ({items.length})</p>
            {items.length === 0 && <div className="flow-state">No grades for this term.</div>}
            {items.map((item) => (
              <FlowListCard
                key={item.id}
                title={`${item.subjectCode}${item.courseNumber}`}
                subtitle={item.courseTitle}
                meta={item.crn !== '—' ? `CRN ${item.crn}` : item.termLevelCode}
                status={item.finalGrade}
                statusTone="good"
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
              { label: 'Mid-term', value: detail.midGrade },
              { label: 'Final', value: detail.finalGrade },
              { label: 'Posted', value: detail.gradeDate },
              { label: 'CRN', value: detail.crn },
              { label: 'Section', value: detail.section },
              { label: 'Type', value: detail.subjectType },
              { label: 'Term', value: detail.termCode || selectedTerm?.LEVELTERMCODE || termCode },
              { label: 'Term level', value: detail.termLevelCode },
            ]}
          />
        </div>
      )}
    </AcademicFlowShell>
  );
};
