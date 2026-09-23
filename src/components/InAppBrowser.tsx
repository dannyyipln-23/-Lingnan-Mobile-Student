import React, { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, LoaderCircle } from 'lucide-react';
import { useAppPreferences } from '../context/AppPreferencesContext';

export const InAppBrowser: React.FC = () => {
  const { inAppBrowser, closeInAppBrowser } = useAppPreferences();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
  }, [inAppBrowser?.url]);

  if (!inAppBrowser) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-0 sm:p-4">
      <div className="flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-[var(--surface)] text-[var(--text-primary)] shadow-2xl sm:h-[90vh] sm:rounded-3xl sm:border sm:border-[var(--border)]">
        <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5">
          <button
            type="button"
            onClick={closeInAppBrowser}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--text-secondary)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-[var(--text-primary)]">{inAppBrowser.title}</p>
            <p className="truncate text-[10px] text-[var(--text-muted)]">{inAppBrowser.url}</p>
          </div>
          <a
            href={inAppBrowser.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[10px] font-semibold text-[var(--text-secondary)]"
            title="Open in system browser"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="relative min-h-0 flex-1 bg-[var(--surface-muted)]">
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[var(--surface-muted)]">
              <LoaderCircle className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
              <p className="text-xs text-[var(--text-muted)]">Loading page…</p>
            </div>
          )}
          <iframe
            title={inAppBrowser.title}
            src={inAppBrowser.url}
            className="h-full w-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setLoading(false)}
          />
        </div>

        <p className="border-t border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[10px] text-[var(--text-muted)]">
          Some campus sites block in-app embedding. Use the external icon if the page stays blank.
        </p>
      </div>
    </div>
  );
};
