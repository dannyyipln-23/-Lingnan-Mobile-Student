import React from 'react';
import { Bell } from 'lucide-react';

interface StudentHeaderProps {
  pageTitle: string;
  onOpenNotifications: () => void;
  unreadCount: number;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  pageTitle,
  onOpenNotifications,
  unreadCount,
}) => {
  return (
    <header className="stu-header">
      <div className="stu-header__row">
        <div className="stu-header__brand">
          <div className="stu-header__logo">
            <img
              src="lingnan-logo.svg"
              alt="Lingnan University Emblem"
              className="stu-header__logo-img"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="stu-header__text">
            <div className="stu-header__eyebrow">
              <span className="stu-header__uni">Lingnan University</span>
              <span className="stu-header__dot" />
            </div>
            <h1 className="stu-header__title">{pageTitle}</h1>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenNotifications}
          className="stu-header__bell"
          aria-label="Campus Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && <span className="stu-header__badge" />}
        </button>
      </div>
    </header>
  );
};
