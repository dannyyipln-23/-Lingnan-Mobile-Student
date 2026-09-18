import React from 'react';
import { X, Bell, Award, BookOpen, AlertTriangle, Calendar } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'n1',
      title: 'ILP Units Approved & Credited',
      desc: 'Your participation in "Lingnan Centenary Campus Heritage Tour" has been verified and awarded 3 Civic Education units.',
      time: '10 mins ago',
      icon: Award,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'n2',
      title: 'Library Book Due Date Reminder',
      desc: 'Borrowed book "Principles of Risk Management" is due in 3 days. You can renew online via 1-Search.',
      time: '2 hours ago',
      icon: BookOpen,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      id: 'n3',
      title: 'Term 1 Final Exam Timetable Released',
      desc: 'The Registry has published the final examination venues and schedule on the myLingnan portal.',
      time: '1 day ago',
      icon: Calendar,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      id: 'n4',
      title: 'Campus Weather & Transit Alert',
      desc: 'Standby Signal No. 1 is in effect. All classes and Siu Hong MTR campus shuttle bus services remain normal.',
      time: '1 day ago',
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50 border-red-200',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto text-slate-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Campus Notices & Alerts
              </h3>
              <p className="text-[10px] text-slate-500">
                Real-time updates on academic, ILP, and student life
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {notifications.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start space-x-3"
              >
                <div className={`p-2 rounded-xl border shrink-0 ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 truncate pr-1">
                      {item.title}
                    </h4>
                    <span className="text-[9px] text-slate-500 font-mono shrink-0">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition border border-slate-200"
        >
          Mark All as Read
        </button>
      </div>
    </div>
  );
};
