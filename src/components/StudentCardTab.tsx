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
    <div className="card-page">
      {/* Title */}
      <div className="card-heading">
        <div>
          <h2 className="card-heading__title">
            Digital Student ID (e-Card)
          </h2>
          <p className="card-heading__desc">
            Valid for Library turnstiles, Hostel gates & Sports complex
          </p>
        </div>
        <div className="card-status">
          <ShieldCheck className="card-status__icon" />
          <span>Active Status</span>
        </div>
      </div>

      {/* Realistic Lingnan Digital Student ID Card - Lighten Red + Grey Palette */}
      <div className="card-id">
        {/* Top Metallic Red Accent Band */}
        <div className="card-id__band" />
        <div className="card-id__glow" />

        {/* Card Header: Lingnan University Official Emblem & Title */}
        <div className="card-id__header">
          <div className="card-id__brand">
            <div className="card-id__logo">
              <img
                src="/lingnan-logo.svg"
                alt="Lingnan Logo"
                className="card-id__logo-img"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="card-id__uni">
                Lingnan University
              </h3>
              <p className="card-id__type">
                STUDENT IDENTITY CARD
              </p>
            </div>
          </div>

          <div className="card-id__aside">
            <span className="card-id__tagline">
              HK LIBERAL ARTS
            </span>
            <div className="card-nfc">
              <Wifi className="card-nfc__icon" />
              <span>NFC RFID</span>
            </div>
          </div>
        </div>

        {/* Card Body: Photo & Student Credentials */}
        <div className="card-id__body">
          {/* Photo */}
          <div className="card-id__photo-col">
            <div className="card-photo">
              <img
                src={CURRENT_STUDENT.avatarUrl}
                alt={CURRENT_STUDENT.fullName}
                className="card-photo__img"
                referrerPolicy="no-referrer"
              />
              <div className="card-photo__badge">
                UG DEGREE
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="card-id__fields">
            <div>
              <span className="card-field__label">
                Full Name
              </span>
              <p className="card-field__name">
                {CURRENT_STUDENT.fullName}
              </p>
            </div>

            <div>
              <span className="card-field__label">
                Student Number
              </span>
              <p className="card-field__number">
                {CURRENT_STUDENT.studentNumber}
              </p>
            </div>

            <div>
              <span className="card-field__label">
                Major Programme
              </span>
              <p className="card-field__major">
                {CURRENT_STUDENT.major}
              </p>
            </div>

            <div className="card-field__footer">
              <span>Expires: {CURRENT_STUDENT.expectedGraduation}</span>
              <span className="card-field__hostel">{CURRENT_STUDENT.hostelRoom}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Anti-Counterfeit Verification Bar */}
        <div className="card-sync">
          <div className="card-sync__lead">
            <span className="card-sync__live">
              <span className="card-sync__ping"></span>
              <span className="card-sync__dot"></span>
            </span>
            <span className="card-sync__label">
              Live Security Sync:
            </span>
            <span className="card-sync__time">
              {timestamp}
            </span>
          </div>
          <span className="card-sync__auth">
            LU AUTHENTIC
          </span>
        </div>

        {/* Code View: QR code vs Barcode */}
        <div className="card-code">
          <div className="card-code__tabs">
            <button
              type="button"
              onClick={() => setCodeMode('qr')}
              className={`card-code__tab${codeMode === 'qr' ? ' is-active' : ''}`}
            >
              QR Code
            </button>
            <button
              type="button"
              onClick={() => setCodeMode('barcode')}
              className={`card-code__tab${codeMode === 'barcode' ? ' is-active' : ''}`}
            >
              Barcode
            </button>
          </div>

          {codeMode === 'qr' ? (
            <div className="card-qr">
              <div className="card-qr__frame">
                {/* Simulated SVG QR code with Lingnan emblem center */}
                <svg
                  className="card-qr__svg"
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
              <p className="card-qr__token">
                TOKEN: {CURRENT_STUDENT.studentNumber}-98B2
              </p>
            </div>
          ) : (
            <div className="card-barcode">
              <div className="card-barcode__bars">
                {[4, 2, 6, 1, 3, 5, 2, 7, 2, 4, 1, 6, 3, 2, 5, 1, 4, 6, 2, 3, 5, 2, 4].map((width, idx) => (
                  <div
                    key={idx}
                    className="card-barcode__bar"
                    style={{ width: `${width * 2}px` }}
                  />
                ))}
              </div>
              <p className="card-barcode__label">
                *{CURRENT_STUDENT.studentNumber}*
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Gate Tap Simulator */}
      <div className="card-tap">
        {tapSuccess ? (
          <div className="card-tap__success">
            <Check className="card-tap__success-icon" />
            <span className="card-tap__success-text">
              Gate Access Verified: Turnstile Opened (Beep!)
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSimulateTap}
            disabled={isSimulatingTap}
            className="card-tap__btn"
          >
            <Wifi className="card-tap__btn-icon" />
            <span>
              {isSimulatingTap
                ? 'Reading RFID Sensor...'
                : 'Simulate Turnstile RFID Tap'}
            </span>
          </button>
        )}

        <p className="card-tap__hint">
          Supports automated NFC tap. Increase screen brightness if barcode reader fails.
        </p>
      </div>

      {/* Card Privileges & Rights */}
      <div className="card-priv">
        <h4 className="card-priv__title">
          <Info className="card-priv__icon" />
          <span>Card Privileges & Entitlements</span>
        </h4>
        <div className="card-priv__grid">
          <div className="card-priv__item">
            <span className="card-priv__label">
              Library Privileges
            </span>
            <span className="card-priv__value">
              Borrow up to 50 items
            </span>
          </div>
          <div className="card-priv__item">
            <span className="card-priv__label">
              Hostel Hall Access
            </span>
            <span className="card-priv__value">
              {CURRENT_STUDENT.hostel}
            </span>
          </div>
          <div className="card-priv__item">
            <span className="card-priv__label">
              Sports & Pool
            </span>
            <span className="card-priv__value">
              Complimentary Gym Access
            </span>
          </div>
          <div className="card-priv__item">
            <span className="card-priv__label">
              Transit Concession
            </span>
            <span className="card-priv__value">
              MTR Student Scheme
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
