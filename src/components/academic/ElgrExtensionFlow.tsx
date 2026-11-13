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
        <div className="flow-state flow-state--error">{error}</div>
      </AcademicFlowShell>
    );
  }

  if (!payload) {
    return (
      <AcademicFlowShell title="ELGR Extension System" theme="elgr" onBack={onBack}>
        <div className="flow-state">Loading…</div>
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
      backLabel={step === 'overview' ? 'Academic' : 'Back'}
      stepIndex={stepIndexMap[step]}
      stepCount={3}
    >
      {step === 'overview' && (
        <div className="space-y-3">
          <div className="flow-hero">
            <div className="flow-hero__top">
              <div className="min-w-0">
                <p className="flow-hero__eyebrow">English Language Graduation Requirement</p>
                <p className="flow-hero__title">
                  {overview.studentName}
                </p>
                <p className="elgr-hero__id">
                  {overview.studentId} · {overview.studyYear}
                </p>
              </div>
            </div>

            <div className="elgr-chips">
              <span className={`status-chip status-chip--${fulfilled ? 'good' : 'warn'}`}>
                {overview.elgrResult}
              </span>
              <span className={`status-chip status-chip--${statusTone(overview.currentExtensionStatus)}`}>
                Extension {overview.currentExtensionStatus}
              </span>
            </div>

            <div className="elgr-deadlines">
              <div>
                <p className="elgr-deadlines__label">
                  Catalogue deadline
                </p>
                <p className="elgr-deadlines__value">
                  {formatDate(overview.catalogTermDeadline)}
                </p>
              </div>
              <div>
                <p className="elgr-deadlines__label">
                  Extended to
                </p>
                <p className="elgr-deadlines__value">
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

          <div className="elgr-stats">
            {[
              { label: 'Approved', value: statusCounts.approved },
              { label: 'Rejected', value: statusCounts.rejected },
              { label: 'Closed', value: statusCounts.closed },
            ].map((stat) => (
              <div
                key={stat.label}
                className="elgr-stat"
              >
                <p className="elgr-stat__label">
                  {stat.label}
                </p>
                <p className="elgr-stat__value">{stat.value}</p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setStep('list')}
            className="list-card"
          >
            <div className="list-card__row">
              <div>
                <p className="list-card__title">
                  Extension applications
                </p>
                <p className="list-card__meta">
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
                  className="flow-detail"
                >
                  <div className="flow-detail__head">
                    <h3 className="flow-detail__title">
                      {block.title}
                    </h3>
                  </div>
                  <p className="flow-detail__body">
                    {block.body}
                  </p>
                </section>
              ))}

              {selectedApp.detail.attachmentName && (
                <div className="elgr-attach">
                  <div className="elgr-attach__icon">
                    <FileText className="elgr-attach__svg" />
                  </div>
                  <div className="min-w-0">
                    <p className="elgr-attach__label">
                      Attachment
                    </p>
                    <p className="elgr-attach__name">
                      {selectedApp.detail.attachmentName}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flow-state">
              No detailed narrative is available for this application in the mock payload.
            </div>
          )}
        </div>
      )}
    </AcademicFlowShell>
  );
};
