import React from 'react';
import { X, Bell, Award, BookOpen, AlertTriangle, Calendar, Wallet } from 'lucide-react';

export type NotificationKind = 'award' | 'library' | 'exam' | 'alert' | 'study' | 'efees';

export interface AppNotification {
  id: string;
  title: string;
  desc: string;
  time: string;
  kind: NotificationKind;
  isRead: boolean;
  action?: 'efees';
}

/** Official university push kinds shown in Campus Notices & Alerts. */
export const OFFICIAL_PUSH_KINDS: ReadonlySet<NotificationKind> = new Set([
  'award',
  'library',
  'exam',
  'alert',
  'efees',
]);

export const isOfficialPushNotification = (item: AppNotification): boolean =>
  OFFICIAL_PUSH_KINDS.has(item.kind);

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onNotificationClick?: (item: AppNotification) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onNotificationClick,
}) => {
  if (!isOpen) return null;

  const officialNotifications = notifications.filter(isOfficialPushNotification);

  const iconMap: Record<
    NotificationKind,
    { icon: React.ComponentType<{ className?: string }>; tone: string }
  > = {
    award: { icon: Award, tone: 'notif-kind--award' },
    library: { icon: BookOpen, tone: 'notif-kind--library' },
    exam: { icon: Calendar, tone: 'notif-kind--exam' },
    alert: { icon: AlertTriangle, tone: 'notif-kind--alert' },
    study: { icon: Bell, tone: 'notif-kind--study' },
    efees: { icon: Wallet, tone: 'notif-kind--efees' },
  };

  return (
    <div className="notif-overlay">
      <div className="notif-sheet">
        <div className="notif-sheet__head">
          <div className="notif-sheet__brand">
            <div className="notif-sheet__bell">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="notif-sheet__title">Campus Notices & Alerts</h3>
            </div>
          </div>
          <button type="button" onClick={onClose} className="notif-sheet__close" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="notif-list">
          {officialNotifications.length === 0 ? (
            <div className="notif-empty">No official push notifications yet.</div>
          ) : (
            officialNotifications.map((item) => {
              const meta = iconMap[item.kind];
              const Icon = meta.icon;
              const clickable = Boolean(onNotificationClick && item.action);

              const content = (
                <>
                  <div className={`notif-kind ${meta.tone}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="notif-item__body">
                    <div className="notif-item__row">
                      <h4 className="notif-item__title">{item.title}</h4>
                      <span className="notif-item__time">{item.time}</span>
                    </div>
                    <p className="notif-item__desc">{item.desc}</p>
                  </div>
                </>
              );

              if (clickable) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`notif-item notif-item--button${item.isRead ? ' is-read' : ' is-unread'}`}
                    onClick={() => onNotificationClick?.(item)}
                  >
                    {content}
                  </button>
                );
              }

              return (
                <div
                  key={item.id}
                  className={`notif-item${item.isRead ? ' is-read' : ' is-unread'}`}
                >
                  {content}
                </div>
              );
            })
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            onMarkAllRead();
            onClose();
          }}
          className="notif-sheet__action"
        >
          Mark All as Read
        </button>
      </div>
    </div>
  );
};
