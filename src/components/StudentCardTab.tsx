import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Barcode, 
  ShieldCheck, 
  Wifi, 
  Check, 
  Info
} from 'lucide-react';
import { CURRENT_STUDENT } from '../data/mockData';

export const StudentCardTab: React.FC = () => {
  const [codeMode, setCodeMode] = useState<'qr' | 'barcode'>('qr');
  const [timestamp, setTimestamp] = useState<string>('');
  const [isSimulatingTap, setIsSimulatingTap] = useState<boolean>(false);
  const [tapSuccess, setTapSuccess] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimestamp(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateTap = () => {
    setIsSimulatingTap(true);
    setTimeout(() => {
      setIsSimulatingTap(false);
      setTapSuccess(true);
      setTimeout(() => setTapSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-4 text-slate-800">
      {/* Title */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Digital Student ID (e-Card)
          </h2>
          <p className="text-xs text-slate-500">
            Valid for Library turnstiles, Hostel gates & Sports complex
          </p>
        </div>
        <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-700 font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Active Status</span>
        </div>
      </div>

      {/* Realistic Lingnan Digital Student ID Card - Lighten Red + Grey Palette */}
      <div className="relative overflow-hidden rounded-3xl bg-white border-2 border-red-200 shadow-xl p-5">
        {/* Top Metallic Red Accent Band */}
        <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-red-600 via-red-500 to-slate-400" />
        <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-red-100/40 blur-2xl pointer-events-none" />

        {/* Card Header: Lingnan University Official Emblem & Title */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mt-1">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-full bg-slate-50 p-0.5 shadow-sm ring-1 ring-red-500/30 shrink-0 flex items-center justify-center border border-slate-200">
              <img
                src="/lingnan-logo.svg"
                alt="Lingnan Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="text-xs font-black tracking-wider text-red-600 uppercase">
                Lingnan University
              </h3>
              <p className="text-[10px] text-slate-600 font-bold tracking-tight">
                STUDENT IDENTITY CARD
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[9px] font-mono font-semibold text-slate-500 tracking-wider">
              HK LIBERAL ARTS
            </span>
            <div className="flex items-center space-x-1 text-[10px] text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-200 mt-0.5">
              <Wifi className="w-3 h-3 rotate-90" />
              <span>NFC RFID</span>
            </div>
          </div>
        </div>

        {/* Card Body: Photo & Student Credentials */}
        <div className="grid grid-cols-3 gap-3.5 mt-4 items-center">
          {/* Photo */}
          <div className="col-span-1">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-100">
              <img
                src={CURRENT_STUDENT.avatarUrl}
                alt={CURRENT_STUDENT.fullName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 inset-x-0 bg-red-600 text-[8px] font-bold text-white text-center py-0.5 tracking-wider">
                UG DEGREE
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="col-span-2 space-y-1.5 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block leading-none font-medium">
                Full Name
              </span>
              <p className="text-sm font-black text-slate-900">
                {CURRENT_STUDENT.fullName}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block leading-none font-medium">
                Student Number
              </span>
              <p className="text-base font-mono font-extrabold text-red-600 tracking-wider">
                {CURRENT_STUDENT.studentNumber}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block leading-none font-medium">
                Major Programme
              </span>
              <p className="text-[11px] font-semibold text-slate-700 line-clamp-2">
                {CURRENT_STUDENT.major}
              </p>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
              <span>Expires: {CURRENT_STUDENT.expectedGraduation}</span>
              <span className="font-semibold text-slate-700">{CURRENT_STUDENT.hostelRoom}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Anti-Counterfeit Verification Bar */}
        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="text-[11px] text-slate-600 font-medium">
              Live Security Sync:
            </span>
            <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
              {timestamp}
            </span>
          </div>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
            LU AUTHENTIC
          </span>
        </div>

        {/* Code View: QR code vs Barcode */}
        <div className="mt-4 p-3 bg-slate-50 rounded-2xl flex flex-col items-center justify-center text-slate-900 border border-slate-200">
          <div className="flex items-center space-x-2 mb-2">
            <button
              type="button"
              onClick={() => setCodeMode('qr')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                codeMode === 'qr'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              QR Code
            </button>
            <button
              type="button"
              onClick={() => setCodeMode('barcode')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                codeMode === 'barcode'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Barcode
            </button>
          </div>

          {codeMode === 'qr' ? (
            <div className="flex flex-col items-center py-2">
              <div className="relative p-2 border-2 border-dashed border-red-500/80 rounded-xl bg-white shadow-xs">
                {/* Simulated SVG QR code with Lingnan emblem center */}
                <svg
                  className="w-44 h-44"
                  viewBox="0 0 100 100"
                  fill="currentColor"
                >
                  <rect width="100" height="100" fill="white" />
                  {/* Outer corner markers */}
                  <rect x="5" y="5" width="26" height="26" fill="#334155" rx="4" />
                  <rect x="9" y="9" width="18" height="18" fill="white" rx="2" />
                  <rect x="13" y="13" width="10" height="10" fill="#E11D48" rx="2" />

                  <rect x="69" y="5" width="26" height="26" fill="#334155" rx="4" />
                  <rect x="73" y="9" width="18" height="18" fill="white" rx="2" />
                  <rect x="77" y="13" width="10" height="10" fill="#E11D48" rx="2" />

                  <rect x="5" y="69" width="26" height="26" fill="#334155" rx="4" />
                  <rect x="9" y="73" width="18" height="18" fill="white" rx="2" />
                  <rect x="13" y="77" width="10" height="10" fill="#E11D48" rx="2" />

                  {/* Matrix dots */}
                  <rect x="36" y="8" width="6" height="6" fill="#334155" />
                  <rect x="46" y="12" width="6" height="6" fill="#334155" />
                  <rect x="56" y="8" width="6" height="6" fill="#334155" />
                  <rect x="8" y="36" width="6" height="6" fill="#334155" />
                  <rect x="18" y="44" width="6" height="6" fill="#334155" />
                  <rect x="68" y="36" width="6" height="6" fill="#334155" />
                  <rect x="78" y="44" width="6" height="6" fill="#334155" />
                  <rect x="88" y="52" width="6" height="6" fill="#334155" />
                  <rect x="36" y="76" width="6" height="6" fill="#334155" />
                  <rect x="46" y="84" width="6" height="6" fill="#334155" />
                  <rect x="56" y="76" width="6" height="6" fill="#334155" />
                  <rect x="68" y="68" width="6" height="6" fill="#334155" />
                  <rect x="82" y="78" width="6" height="6" fill="#334155" />
                  <rect x="76" y="86" width="6" height="6" fill="#334155" />

                  {/* Center circle with Lingnan Emblem */}
                  <circle cx="50" cy="50" r="13" fill="white" stroke="#E11D48" strokeWidth="1.5" />
                  <circle cx="50" cy="50" r="10" fill="#E11D48" />
                  <path d="M 44 47 Q 50 42 56 47 Q 50 51 44 47 Z" fill="#e2e8f0" />
                  <path d="M 48 51 Q 50 58 52 59" stroke="#e2e8f0" strokeWidth="2" fill="none" />
                </svg>
              </div>
              <p className="text-[10px] font-mono text-slate-500 mt-1">
                TOKEN: {CURRENT_STUDENT.studentNumber}-98B2
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4 w-full px-4">
              <div className="w-full h-16 flex items-center justify-between px-2 bg-white border border-slate-300 rounded shadow-xs">
                {[4, 2, 6, 1, 3, 5, 2, 7, 2, 4, 1, 6, 3, 2, 5, 1, 4, 6, 2, 3, 5, 2, 4].map((width, idx) => (
                  <div
                    key={idx}
                    className="h-12 bg-slate-900 rounded-xs"
                    style={{ width: `${width * 2}px` }}
                  />
                ))}
              </div>
              <p className="font-mono text-sm tracking-widest font-bold text-slate-800 mt-2">
                *{CURRENT_STUDENT.studentNumber}*
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Gate Tap Simulator */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 text-center shadow-sm">
        {tapSuccess ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center justify-center space-x-2 animate-pulse">
            <Check className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold">
              Gate Access Verified: Turnstile Opened (Beep!)
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSimulateTap}
            disabled={isSimulatingTap}
            className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm shadow-red-200 flex items-center justify-center space-x-2 transition active:scale-98 disabled:opacity-50"
          >
            <Wifi className="w-4 h-4 rotate-90" />
            <span>
              {isSimulatingTap
                ? 'Reading RFID Sensor...'
                : 'Simulate Turnstile RFID Tap'}
            </span>
          </button>
        )}

        <p className="text-[11px] text-slate-500 mt-2">
          Supports automated NFC tap. Increase screen brightness if barcode reader fails.
        </p>
      </div>

      {/* Card Privileges & Rights */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2.5 shadow-sm">
        <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
          <Info className="w-4 h-4 text-red-600" />
          <span>Card Privileges & Entitlements</span>
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-medium">
              Library Privileges
            </span>
            <span className="font-semibold text-slate-800">
              Borrow up to 50 items
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-medium">
              Hostel Hall Access
            </span>
            <span className="font-semibold text-slate-800">
              {CURRENT_STUDENT.hostel}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-medium">
              Sports & Pool
            </span>
            <span className="font-semibold text-slate-800">
              Complimentary Gym Access
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-medium">
              Transit Concession
            </span>
            <span className="font-semibold text-slate-800">
              MTR Student Scheme
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
