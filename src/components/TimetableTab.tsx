import React, { useMemo, useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft,
  ChevronRight,
  MapPin, 
  User, 
  BookOpen, 
  Plus,
  Check,
  X
} from 'lucide-react';
import { COURSES } from '../data/mockData';
import { CourseSession } from '../types';

type CalendarViewMode = 'week' | 'month';

const WEEKDAY_COLUMNS = [
  { label: 'Sun', academicDay: 7 },
  { label: 'Mon', academicDay: 1 },
  { label: 'Tue', academicDay: 2 },
  { label: 'Wed', academicDay: 3 },
  { label: 'Thu', academicDay: 4 },
  { label: 'Fri', academicDay: 5 },
  { label: 'Sat', academicDay: 6 },
] as const;

const mapJsDayToAcademicDay = (jsDay: number): number => (jsDay === 0 ? 7 : jsDay);
const mapAcademicDayToCalendarOffset = (academicDay: number): number => academicDay % 7;

const getMonthGridStart = (year: number, monthIndex: number): Date => {
  const firstOfMonth = new Date(year, monthIndex, 1);
  return new Date(year, monthIndex, 1 - firstOfMonth.getDay());
};

const getDateByWeekAndDay = (
  year: number,
  monthIndex: number,
  week: number,
  dayOfWeek: number,
): Date => {
  const gridStart = getMonthGridStart(year, monthIndex);
  const date = new Date(gridStart);
  date.setDate(gridStart.getDate() + (week - 1) * 7 + mapAcademicDayToCalendarOffset(dayOfWeek));
  return date;
};

const getWeekOfMonth = (date: Date): number => {
  const gridStart = getMonthGridStart(date.getFullYear(), date.getMonth());
  const diffMs = date.getTime() - gridStart.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const week = Math.floor(diffDays / 7) + 1;
  return Math.max(1, Math.min(6, week));
};

const isSameDate = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildReminderDateTime = (date: Date, time: string): string => `${toDateKey(date)}T${time}`;

const formatReminderDateTime = (reminderDateTime: string): string => {
  const [datePart, timePart] = reminderDateTime.split('T');
  if (!datePart || !timePart) return reminderDateTime;

  const [year, month, day] = datePart.split('-').map(Number);
  if (!year || !month || !day) return reminderDateTime;

  const displayDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
    new Date(year, month - 1, day),
  );

  return `${displayDate} ${timePart}`;
};

interface StudyTask {
  id: string;
  text: string;
  reminderDateTime: string;
  done: boolean;
  dateKey: string;
}

interface TimetableTabProps {
  onAddStudyReminder: (taskText: string, reminderDateTime: string) => void;
}

export const TimetableTab: React.FC<TimetableTabProps> = ({ onAddStudyReminder }) => {
  const initialSelectedDate = new Date(2026, 7, 31);
  const initialSelectedDateKey = toDateKey(initialSelectedDate);
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [calendarAnchor, setCalendarAnchor] = useState<Date>(new Date(2026, 8, 1));
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<number>(1); // 1 = Monday
  const [selectedDate, setSelectedDate] = useState<Date>(initialSelectedDate);
  const [activeCourse, setActiveCourse] = useState<CourseSession | null>(null);
  const [tasks, setTasks] = useState<StudyTask[]>([
    {
      id: 't1',
      text: 'RIM2201 Case Study on Climate Risk Insurance',
      reminderDateTime: `${initialSelectedDateKey}T23:59`,
      done: false,
      dateKey: initialSelectedDateKey,
    },
    {
      id: 't2',
      text: 'CDS2001 Python Pandas assignment submission',
      reminderDateTime: '2026-09-02T17:00',
      done: true,
      dateKey: '2026-09-02',
    },
  ]);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('18:00');

  const activeYear = calendarAnchor.getFullYear();
  const activeMonth = calendarAnchor.getMonth();

  const dayCourses = COURSES.filter((c) => c.dayOfWeek === selectedDay);

  const selectedDateLabel = useMemo(
    () => new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(selectedDate),
    [selectedDate],
  );

  const selectedDateKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);
  const selectedDayTasks = useMemo(
    () => tasks.filter((task) => task.dateKey === selectedDateKey),
    [selectedDateKey, tasks],
  );

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(calendarAnchor),
    [calendarAnchor],
  );

  const weekDays = useMemo(
    () => WEEKDAY_COLUMNS.map((column) => {
      const date = getDateByWeekAndDay(activeYear, activeMonth, selectedWeek, column.academicDay);
      return {
        label: column.label,
        day: column.academicDay,
        date,
      };
    }),
    [activeMonth, activeYear, selectedWeek],
  );

  const monthCells = useMemo(() => {
    const gridStart = getMonthGridStart(activeYear, activeMonth);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);

      const academicDay = mapJsDayToAcademicDay(date.getDay());
      const isInMonth = date.getMonth() === activeMonth;
      const isWeekend = academicDay >= 6;
      const courseCount = isInMonth && !isWeekend
        ? COURSES.filter((course) => course.dayOfWeek === academicDay).length
        : 0;

      return {
        date,
        academicDay,
        isInMonth,
        isWeekend,
        courseCount,
      };
    });
  }, [activeMonth, activeYear]);

  const handleSelectDay = (week: number, day: number) => {
    const newDate = getDateByWeekAndDay(activeYear, activeMonth, week, day);
    setSelectedWeek(week);
    setSelectedDay(day);
    setSelectedDate(newDate);
  };

  const handleSelectMonthCell = (date: Date, academicDay: number) => {
    setSelectedDate(date);
    setSelectedDay(academicDay);
    setSelectedWeek(getWeekOfMonth(date));
  };

  const handleShiftMonth = (offset: number) => {
    const nextAnchor = new Date(activeYear, activeMonth + offset, 1);
    setCalendarAnchor(nextAnchor);

    const nextDate = getDateByWeekAndDay(nextAnchor.getFullYear(), nextAnchor.getMonth(), 1, 1);
    setSelectedWeek(1);
    setSelectedDay(1);
    setSelectedDate(nextDate);
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedTask = newTaskInput.trim();
    const normalizedTime = newTaskTime.trim();
    if (!normalizedTask) return;
    const reminderDateTime = buildReminderDateTime(selectedDate, normalizedTime);
    setTasks(prev => [
      ...prev,
      {
        id: `t-${Date.now()}`,
        text: normalizedTask,
        reminderDateTime,
        done: false,
        dateKey: selectedDateKey,
      },
    ]);
    onAddStudyReminder(normalizedTask, reminderDateTime);
    setNewTaskInput('');
    setNewTaskTime('18:00');
  };

  return (
    <div className="page-shell page-shell--timetable space-y-4">
      {/* Header */}
      <div className="px-1">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Course Calendar
          </h2>
          <p className="text-xs text-slate-500">
            2025/2026 Academic Year • Term 1
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-3 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'week'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly
            </button>
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'month'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-1.5 py-1 bg-slate-50">
            <button
              type="button"
              onClick={() => handleShiftMonth(-1)}
              className="rounded-md p-1 text-slate-600 hover:bg-white hover:text-slate-900"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-800 min-w-[8rem] text-center">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={() => handleShiftMonth(1)}
              className="rounded-md p-1 text-slate-600 hover:bg-white hover:text-slate-900"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {viewMode === 'week' ? (
          <>
            <div className="grid grid-cols-6 gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((week) => {
                const isSelected = selectedWeek === week;
                return (
                  <button
                    key={week}
                    type="button"
                    onClick={() => handleSelectDay(week, selectedDay)}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition ${
                      isSelected
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    Week {week}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-7 gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-200">
              {weekDays.map((item) => {
                const isSelected = selectedDay === item.day;
                const count = COURSES.filter((c) => c.dayOfWeek === item.day).length;

                return (
                  <button
                    key={`${item.label}-${item.date.toISOString()}`}
                    type="button"
                    onClick={() => handleSelectDay(selectedWeek, item.day)}
                    className={`py-2 px-1 rounded-lg flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    <span className="text-xs">{item.label}</span>
                    <span className="text-[10px] mt-0.5 opacity-85">{item.date.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wide px-1">
              <span className="text-center">Sun</span>
              <span className="text-center">Mon</span>
              <span className="text-center">Tue</span>
              <span className="text-center">Wed</span>
              <span className="text-center">Thu</span>
              <span className="text-center">Fri</span>
              <span className="text-center">Sat</span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {monthCells.map((cell) => {
                const isSelected = isSameDate(cell.date, selectedDate);

                return (
                  <button
                    key={cell.date.toISOString()}
                    type="button"
                    onClick={() => handleSelectMonthCell(cell.date, cell.academicDay)}
                    disabled={!cell.isInMonth}
                    className={`min-h-[3.25rem] rounded-lg border px-1 py-1 text-left transition ${
                      isSelected
                        ? 'border-red-400 bg-red-50'
                        : cell.isInMonth
                        ? 'border-slate-200 bg-white hover:border-slate-300'
                        : 'border-slate-100 bg-slate-50 text-slate-300'
                    }`}
                  >
                    <span className={`block text-[10px] font-semibold ${cell.isInMonth ? 'text-slate-700' : 'text-slate-300'}`}>
                      {cell.date.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="px-1">
        <p className="text-xs text-slate-600">
          Showing classes for <span className="font-bold text-slate-900">{selectedDateLabel}</span>
        </p>
      </div>

      {/* Course List for the selected day */}
      <div className="space-y-3">
        {dayCourses.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-500 shadow-xs">
            <CalendarIcon className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-xs font-semibold text-slate-700">
              No scheduled lectures on this day
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Take time for library study or attend campus ILP activities!
            </p>
          </div>
        ) : (
          dayCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => setActiveCourse(course)}
              className="cursor-pointer group rounded-2xl bg-white border border-slate-200 p-4 hover:border-red-400 transition shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2.5 h-10 rounded-full shrink-0"
                    style={{ backgroundColor: course.color }}
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-mono">
                        {course.courseCode}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {course.section}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1 group-hover:text-red-600 transition-colors">
                      {course.courseName}
                    </h3>
                  </div>
                </div>

                <span className="text-xs font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 shrink-0">
                  {course.startTime} - {course.endTime}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center space-x-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span className="text-slate-800 font-medium truncate">{course.venue}</span>
                </div>
                <div className="flex items-center space-x-1.5 truncate justify-end">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{course.instructor}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                  Attendance: {course.attendanceRate}%
                </span>
                <span className="text-red-600 font-medium flex items-center space-x-0.5">
                  <span>Course Details</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Course Detail Modal */}
      {activeCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto text-slate-800 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">
                  {activeCourse.courseCode} • {activeCourse.section}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {activeCourse.courseName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveCourse(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Classroom Venue</span>
                  <span className="font-bold text-slate-800">{activeCourse.venue}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Instructor</span>
                  <span className="font-bold text-slate-800">{activeCourse.instructor}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Academic Credits</span>
                  <span className="font-bold text-slate-800">{activeCourse.credits} Credits</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Pending Assignments</span>
                  <span className="font-bold text-amber-700">{activeCourse.assignmentsDue} Tasks</span>
                </div>
              </div>

              <div className="p-3 bg-red-50/60 rounded-xl space-y-1 border border-red-100">
                <span className="font-bold text-red-700 block">
                  Campus Navigation Tip
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Head to {activeCourse.building}, take the central lift to the designated floor. Tap your Student e-Card at the entrance reader to register attendance.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveCourse(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition border border-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Student Study Tasks & Assignments */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded-md bg-red-50 text-red-600">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">
              Assignments & Study Reminders
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-slate-500">
            {selectedDayTasks.filter((t) => !t.done).length} pending
          </span>
        </div>

        <div className="space-y-2">
          {selectedDayTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-500">
              No reminders for this day yet.
            </div>
          ) : (
            selectedDayTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-slate-300 transition"
              >
                <div className="flex items-center space-x-2.5 truncate mr-2">
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                      task.done
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {task.done && <Check className="w-3 h-3" />}
                  </div>
                  <span
                    className={`text-xs truncate font-medium ${
                      task.done ? 'line-through text-slate-400' : 'text-slate-800'
                    }`}
                  >
                    {task.text}
                  </span>
                </div>
                <span className="text-[10px] text-red-600 font-mono font-semibold shrink-0">
                  {formatReminderDateTime(task.reminderDateTime)}
                </span>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddTask} className="space-y-2 pt-1">
          <input
            type="text"
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            placeholder="Add personal study task or deadline..."
            className="w-full bg-slate-50 text-xs text-slate-800 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
          />
          <div className="flex items-center space-x-2">
            <input
              type="time"
              value={newTaskTime}
              onChange={(e) => setNewTaskTime(e.target.value)}
              className="w-28 bg-slate-50 text-xs text-slate-800 px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
              aria-label="Reminder time"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0 transition shadow-xs"
              aria-label="Add reminder"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
