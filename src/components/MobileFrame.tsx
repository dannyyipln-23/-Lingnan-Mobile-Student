import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col items-center justify-start py-0 md:py-6 px-0 md:px-4">
      {/* Top Desktop Controls Bar (Only visible on medium+ screens) */}
      <aside aria-label="Device Viewport Controls" className="hidden md:flex items-center justify-between w-full max-w-md mb-3 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-xs shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-semibold text-slate-700">
            Lingnan Mobile (Student Edition)
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setIsPhoneFrame(true)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
              isPhoneFrame
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Mobile Smartphone Frame"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Phone</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPhoneFrame(false)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
              !isPhoneFrame
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Expand Full Screen View"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Full</span>
          </button>
        </div>
      </aside>

      {/* Main App Container */}
      <div
        className={`w-full transition-all duration-300 relative ${
          isPhoneFrame
            ? 'max-w-md bg-slate-50 md:rounded-[44px] md:border-[10px] md:border-slate-800 md:shadow-2xl md:shadow-slate-300/60 overflow-hidden ring-1 ring-slate-900/10'
            : 'max-w-3xl bg-slate-50 rounded-3xl border border-slate-200 shadow-xl overflow-hidden'
        }`}
        style={{ minHeight: '100vh' }}
      >
        {/* Smartphone Hardware Elements (Status Bar & Dynamic Island) */}
        {isPhoneFrame && (
          <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-6 pt-2.5 pb-1.5 flex items-center justify-between text-slate-700 text-xs border-b border-slate-200/60 select-none">
            {/* Clock */}
            <span className="font-semibold text-[13px] tracking-tight text-slate-800 font-mono">
              {currentTime}
            </span>

            {/* Dynamic Island Pill */}
            <div className="w-24 h-4 bg-slate-900 rounded-full flex items-center justify-center space-x-1.5 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-slate-800" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {/* Hardware Status Icons */}
            <div className="flex items-center space-x-1.5">
              <Signal className="w-3.5 h-3.5 text-slate-600" />
              <Wifi className="w-3.5 h-3.5 text-slate-600" />
              <Battery className="w-4 h-4 text-slate-700" />
            </div>
          </div>
        )}

        {/* Child Views */}
        <div className="p-4 sm:p-5">{children}</div>

        {/* Home Indicator Bar */}
        {isPhoneFrame && (
          <div className="fixed bottom-1 left-0 right-0 z-50 pointer-events-none flex justify-center pb-1">
            <div className="w-32 h-1 bg-slate-400/80 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};
