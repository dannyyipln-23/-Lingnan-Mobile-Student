import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Languages } from 'lucide-react';
import { AcademicFlowShell } from './AcademicFlowShell';
import { DetailSection } from './DetailSection';
import { FlowListCard } from './FlowListCard';

type FlowStep = 'overview' | 'list' | 'detail';

type ApplicationDetail = {
  reason: string;
  plan: string;
  timeline: string;
  requestedExtendDate: string;
  ieltsTaken: boolean;
  attachmentName?: string;
};

type ElgrApplication = {
  id: string;
  catalogTerm: string;
  majorCode: string;
  statusCode: string;
  status: string;
  createdAt: string;
  catalogTermDeadline: string;
  extendedDate: string | null;
  program: string;
  detail: ApplicationDetail | null;
};

type ElgrPayload = {
  title: string;
  subtitle?: string;
  overview: {
    studentId: string;
    studentName: string;
    studyYear: string;
    admitTerm: string;
    catalogueYear: string;
    academicYearCode: string;
    program: string;
    majorCode: string;
    elgrResult: string;
    catalogTermDeadline: string;
    extendedDeadline: string | null;
    currentExtensionStatus: string;
  };
  applications: ElgrApplication[];
};

interface ElgrExtensionFlowProps {
  onBack: () => void;
}

const stepIndexMap: Record<FlowStep, number> = { overview: 0, list: 1, detail: 2 };

const isPlaceholderDate = (value?: string | null): boolean => {
  if (!value) {
    return true;
  }
  return value.startsWith('1900-01-01');
};

const formatDate = (value?: string | null): string => {
  if (!value || isPlaceholderDate(value)) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const statusTone = (status: string): 'good' | 'warn' | 'muted' | 'default' => {
  const normalized = status.toLowerCase();
  if (normalized.includes('approved') || normalized.includes('fulfilled')) {
    return 'good';
  }
  if (normalized.includes('reject') || normalized.includes('not fulfilled')) {
    return 'warn';
  }
  if (normalized.includes('closed')) {
    return 'muted';
  }
  return 'default';
};

export const ElgrExtensionFlow: React.FC<ElgrExtensionFlowProps> = ({ onBack }) => {
  const [payload, setPayload] = useState<ElgrPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<FlowStep>('overview');
  const [appId, setAppId] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    fetch('/mock/academic/elgr-extension-system.json')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load ELGR extension data (${res.status})`);
        }
        return res.json() as Promise<ElgrPayload>;
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

  const selectedApp = useMemo(
    () => payload?.applications.find((app) => app.id === appId),
    [payload, appId],
  );

  const statusCounts = useMemo(() => {
    const counts = { approved: 0, rejected: 0, closed: 0, other: 0 };
    payload?.applications.forEach((app) => {
      const code = app.statusCode.toUpperCase();
      if (code === 'AP') {
        counts.approved += 1;
      } else if (code === 'RJ') {
        counts.rejected += 1;
      } else if (code === 'CC') {
        counts.closed += 1;
      } else {
        counts.other += 1;
      }
    });
    return counts;
  }, [payload]);

  const handleBack = () => {
    if (step === 'detail') {
      setStep('list');
      setAppId('');
      return;
    }
    if (step === 'list') {
      setStep('overview');
      return;
    }
    onBack();
  };

  if (error) {
    return (
      <AcademicFlowShell title="ELGR Extension System" theme="elgr" onBack={onBack}>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">{error}</div>
      </AcademicFlowShell>
    );
  }

  if (!payload) {
    return (
      <AcademicFlowShell title="ELGR Extension System" theme="elgr" onBack={onBack}>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500">Loading…</div>
      </AcademicFlowShell>
    );
  }

  const { overview } = payload;
  const fulfilled = overview.elgrResult.toLowerCase().includes('fulfilled')
    && !overview.elgrResult.toLowerCase().includes('not');

  return (
    <AcademicFlowShell
      title="ELGR Extension System"
      subtitle={
        step === 'overview'
          ? payload.subtitle
          : step === 'list'
            ? `${payload.applications.length} application(s)`
            : selectedApp
              ? `Application #${selectedApp.id}`
              : undefined
      }
      theme="elgr"
      onBack={handleBack}
      backLabel={step === 'overview' ? 'Campus' : 'Back'}
      stepIndex={stepIndexMap[step]}
      stepCount={3}
    >
      {step === 'overview' && (
        <div className="space-y-3">
          <div className="flow-hero">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="flow-hero__eyebrow">English Language Graduation Requirement</p>
                <p className="mt-1 text-lg font-bold tracking-tight text-slate-900">
                  {overview.studentName}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {overview.studentId} · {overview.studyYear}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className={`status-chip status-chip--${fulfilled ? 'good' : 'warn'}`}>
                {overview.elgrResult}
              </span>
              <span className={`status-chip status-chip--${statusTone(overview.currentExtensionStatus)}`}>
                Extension {overview.currentExtensionStatus}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-purple-100 pt-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Catalogue deadline
                </p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">
                  {formatDate(overview.catalogTermDeadline)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Extended to
                </p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">
                  {formatDate(overview.extendedDeadline)}
                </p>
              </div>
            </div>
          </div>

          <DetailSection
            title="Student profile"
            rows={[
              { label: 'Programme', value: overview.program },
              { label: 'Major', value: overview.majorCode },
              { label: 'Admit term', value: overview.admitTerm },
              { label: 'Catalogue year', value: overview.catalogueYear },
              { label: 'Academic year', value: overview.academicYearCode },
            ]}
          />

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Approved', value: statusCounts.approved },
              { label: 'Rejected', value: statusCounts.rejected },
              { label: 'Closed', value: statusCounts.closed },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-center shadow-sm"
              >
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setStep('list')}
            className="list-card"
          >
            <div className="flex items-center justify-between gap-2 pl-1.5">
              <div>
                <p className="text-sm font-bold tracking-tight text-slate-900">
                  Extension applications
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  View status, reasons, and supporting documents
                </p>
              </div>
              <span className="theme-chip">{payload.applications.length}</span>
            </div>
          </button>
        </div>
      )}

      {step === 'list' && (
        <div className="space-y-2">
          <p className="flow-section-label">Applications</p>
          {payload.applications.map((app) => (
            <FlowListCard
              key={app.id}
              title={`Application #${app.id}`}
              subtitle={app.program || `Major ${app.majorCode}`}
              meta={`Submitted ${formatDate(app.createdAt)}`}
              status={app.status}
              statusTone={statusTone(app.status)}
              onClick={() => {
                setAppId(app.id);
                setStep('detail');
              }}
            />
          ))}
        </div>
      )}

      {step === 'detail' && selectedApp && (
        <div className="space-y-3">
          <div className="flow-hero">
            <p className="flow-hero__eyebrow">Application #{selectedApp.id}</p>
            <p className="flow-hero__value text-[1.5rem]">{selectedApp.status}</p>
            <p className="flow-hero__caption">
              Submitted {formatDate(selectedApp.createdAt)}
              {selectedApp.extendedDate
                ? ` · Extended to ${formatDate(selectedApp.extendedDate)}`
                : ''}
            </p>
          </div>

          <DetailSection
            title="Application summary"
            rows={[
              { label: 'Status', value: selectedApp.status },
              { label: 'Status code', value: selectedApp.statusCode },
              { label: 'Catalogue term', value: selectedApp.catalogTerm },
              { label: 'Major', value: selectedApp.majorCode },
              { label: 'Programme', value: selectedApp.program || '—' },
              { label: 'Catalogue deadline', value: formatDate(selectedApp.catalogTermDeadline) },
              { label: 'Extended date', value: formatDate(selectedApp.extendedDate) },
            ]}
          />

          {selectedApp.detail ? (
            <>
              <DetailSection
                title="Request meta"
                rows={[
                  {
                    label: 'Requested extend date',
                    value: formatDate(selectedApp.detail.requestedExtendDate),
                  },
                  {
                    label: 'IELTS taken',
                    value: selectedApp.detail.ieltsTaken ? 'Yes' : 'No',
                  },
                ]}
              />

              {[
                { title: 'Reason', body: selectedApp.detail.reason },
                { title: 'Study plan', body: selectedApp.detail.plan },
                { title: 'Timeline', body: selectedApp.detail.timeline },
              ].map((block) => (
                <section
                  key={block.title}
                  className="overflow-hidden rounded-[1.05rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_4px_14px_rgb(15_23_42_/_0.04)]"
                >
                  <div className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-2.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.07em] text-[var(--text-muted)]">
                      {block.title}
                    </h3>
                  </div>
                  <p className="whitespace-pre-wrap px-3.5 py-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                    {block.body}
                  </p>
                </section>
              ))}

              {selectedApp.detail.attachmentName && (
                <div className="flex items-center gap-2.5 rounded-[1rem] border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: 'color-mix(in srgb, var(--flow-accent) 12%, white)',
                      color: 'var(--flow-accent)',
                    }}
                  >
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Attachment
                    </p>
                    <p className="truncate text-xs font-semibold text-slate-900">
                      {selectedApp.detail.attachmentName}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
              No detailed narrative is available for this application in the mock payload.
            </div>
          )}
        </div>
      )}
    </AcademicFlowShell>
  );
};
