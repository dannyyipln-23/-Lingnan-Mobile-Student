import React, { useState } from 'react';
import { 
  BookOpen, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  LayoutGrid, 
  Calendar,
  GraduationCap, 
  SunMedium, 
  Printer, 
  Check
} from 'lucide-react';
import { COURSES } from '../data/mockData';
import { TabType } from './NavigationBottomBar';

interface HomeTabProps {
  onNavigate: (tab: TabType) => void;
  onOpenLibraryModal: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ onNavigate, onOpenLibraryModal }) => {
  const [checkedInCourses, setCheckedInCourses] = useState<Record<string, boolean>>({
    c1: true,
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCheckIn = (courseId: string, courseCode: string) => {
    setCheckedInCourses((prev) => ({ ...prev, [courseId]: true }));
    setToastMessage(`Checked in successfully: ${courseCode} (Attendance recorded)`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const nextClass = COURSES[1]; // CDS2001 at 13:30

  return (
    <div className="page-shell page-shell--home space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg flex items-center space-x-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="rounded-2xl bg-gradient-to-r from-red-50/90 via-white to-slate-50 border border-red-200 p-3.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-sm shadow-red-200 shrink-0">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 uppercase tracking-wide">
                  Campus Hub
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Applications and student services
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Open categorized applications and campus tools
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('campus')}
            className="text-red-600 font-bold text-xs inline-flex items-center"
          >
            Open
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>

      {/* Next Upcoming Lecture Card */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-emerald-700 tracking-wide uppercase">
              Next Up Today
            </span>
          </div>
          <span className="text-[11px] text-slate-500 flex items-center space-x-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{nextClass.startTime} - {nextClass.endTime}</span>
          </span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-slate-800 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono">
                {nextClass.courseCode}
              </span>
              <span className="text-xs text-slate-700 font-semibold">
                {nextClass.courseName}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-600 mt-2">
              <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span className="text-slate-800 font-medium">{nextClass.venue}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 pl-5">
              {nextClass.instructor}
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-end space-y-1">
            {checkedInCourses[nextClass.id] ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Checked In</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleCheckIn(nextClass.id, nextClass.courseCode)}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm shadow-red-200 transition transform active:scale-95"
              >
                Check In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Access Icons Bar */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
          Student Shortcuts
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onNavigate('timetable')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 transition group shadow-xs"
          >
            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 text-center">
              Timetable
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenLibraryModal}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 transition group shadow-xs"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 text-center">
              Book Seat
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('campus')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 transition group shadow-xs"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 text-center">
              Campus Apps
            </span>
          </button>
        </div>
      </div>

      {/* Graduation ILP Progress Indicator */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded-md bg-red-50 text-red-600">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">
              ILP Graduation Requirement
            </h3>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            84 / 75 Units (112%)
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-red-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: '100%' }}
          />
        </div>
        <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
          <span>Graduation criterion successfully fulfilled</span>
          <button 
            type="button"
            onClick={() => onNavigate('campus')}
            className="text-red-600 font-bold hover:underline"
          >
            Details →
          </button>
        </p>
      </div>

      {/* Campus Live Alerts & Weather */}
      <div className="rounded-xl bg-white border border-slate-200 p-3 text-xs flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2 text-slate-700">
          <SunMedium className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            Tuen Mun Campus: 27°C Sunny • AQHI Good
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-medium">
          Normal Shuttle Schedule
        </span>
      </div>
    </div>
  );
};
