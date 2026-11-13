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
    <div className="frame-root">
      <div
        className="frame-device"
        style={{ ['--frame-pad' as string]: '1rem' }}
      >
        <div className="frame-status">
          <span className="frame-status__time">
            {currentTime}
          </span>

          <div className="frame-notch">
            <span className="frame-notch__cam" />
            <span className="frame-notch__dot" />
          </div>

          <div className="frame-status__icons">
            <Signal className="frame-status__icon" />
            <Wifi className="frame-status__icon" />
            <Battery className="frame-status__battery" />
          </div>
        </div>

        {topBar ? <div className="frame-topbar">{topBar}</div> : null}

        <div
          className="frame-content"
          style={{ ['--content-pad-top' as string]: '0.75rem' }}
        >
          <div className="frame-content__inner">{children}</div>
        </div>

        {bottomBar}

        <div className="frame-home">
          <div className="frame-home__bar" />
        </div>
      </div>
    </div>
  );
};
