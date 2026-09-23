import React, { useEffect, useState } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  topBar?: React.ReactNode;
  bottomBar?: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children, topBar, bottomBar }) => {
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-slate-100 px-0 py-0 text-slate-800">
      <div
        className="relative flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-slate-50 ring-1 ring-slate-900/10 md:h-[min(100dvh,860px)] md:rounded-[44px] md:border-[10px] md:border-slate-800 md:shadow-2xl md:shadow-slate-300/60"
        style={{ ['--frame-pad' as string]: '1rem' }}
      >
        <div className="z-50 flex shrink-0 select-none items-center justify-between border-b border-slate-200/60 bg-white px-5 pb-1 pt-1.5 text-xs text-slate-700">
          <span className="font-mono text-[13px] font-semibold tracking-tight text-slate-800">
            {currentTime}
          </span>

          <div className="flex h-4 w-24 items-center justify-center space-x-1.5 rounded-full bg-slate-900 shadow-inner">
            <span className="h-2 w-2 rounded-full bg-slate-800" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          </div>

          <div className="flex items-center space-x-1.5">
            <Signal className="h-3.5 w-3.5 text-slate-600" />
            <Wifi className="h-3.5 w-3.5 text-slate-600" />
            <Battery className="h-4 w-4 text-slate-700" />
          </div>
        </div>

        {topBar ? <div className="z-40 shrink-0">{topBar}</div> : null}

        <div
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-[var(--frame-pad)] pb-0 pt-3"
          style={{ ['--content-pad-top' as string]: '0.75rem' }}
        >
          <div className="flex min-h-full flex-col">{children}</div>
        </div>

        {bottomBar}

        <div className="pointer-events-none absolute bottom-1 left-0 right-0 z-50 flex justify-center pb-1">
          <div className="h-1 w-32 rounded-full bg-slate-400/80" />
        </div>
      </div>
    </div>
  );
};
