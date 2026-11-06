import React, { useEffect, useMemo, useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft,
  ChevronRight,
  MapPin, 
  User, 
  BookOpen, 
  Plus,
  Check,
  Bell,
  X
} from 'lucide-react';
import { CALENDAR_DEMO_TODAY, STUDY_TASKS, StudyTaskSource } from '../data/mockData';
import { CourseSession } from '../types';
import { fetchHkPublicHolidays, holidayMapFromList } from '../lib/hkPublicHolidays';
import {
  fetchRegisteredCourses,
  isCourseActiveOnDate,
  RegisteredCourse,
  toCourseSession,
} from '../lib/registeredCourses';

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
  source: StudyTaskSource;
}

interface TimetableTabProps {
  onAddStudyReminder: (taskText: string, reminderDateTime: string) => void;
}

export const TimetableTab: React.FC<TimetableTabProps> = ({ onAddStudyReminder }) => {
  const [year, month, day] = CALENDAR_DEMO_TODAY.split('-').map(Number);
  const initialSelectedDate = new Date(year, month - 1, day);
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [calendarAnchor, setCalendarAnchor] = useState<Date>(new Date(year, month - 1, 1));
  const [selectedWeek, setSelectedWeek] = useState<number>(getWeekOfMonth(initialSelectedDate));
  const [selectedDay, setSelectedDay] = useState<number>(mapJsDayToAcademicDay(initialSelectedDate.getDay()));
  const [selectedDate, setSelectedDate] = useState<Date>(initialSelectedDate);
  const [activeCourse, setActiveCourse] = useState<CourseSession | null>(null);
  const [tasks, setTasks] = useState<StudyTask[]>(() =>
    STUDY_TASKS.map((task) => ({ ...task })),
  );
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('18:00');
  const [holidayByDate, setHolidayByDate] = useState<Map<string, string>>(new Map());
  const [registeredCourses, setRegisteredCourses] = useState<RegisteredCourse[]>([]);

  const activeYear = calendarAnchor.getFullYear();
  const activeMonth = calendarAnchor.getMonth();

  useEffect(() => {
    let cancelled = false;
    void fetchRegisteredCourses()
      .then((courses) => {
        if (!cancelled) {
          setRegisteredCourses(courses);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRegisteredCourses([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchHkPublicHolidays()
      .then((holidays) => {
        if (!cancelled) {
          setHolidayByDate(holidayMapFromList(holidays));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHolidayByDate(new Map());
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedDateLabel = useMemo(
    () => new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(selectedDate),
    [selectedDate],
  );

  const selectedDateKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);
  const selectedHolidayName = holidayByDate.get(selectedDateKey);
  const selectedDayTasks = useMemo(
    () => tasks.filter((task) => task.dateKey === selectedDateKey),
    [selectedDateKey, tasks],
  );

  const dayCourses = useMemo(() => {
    return registeredCourses
      .filter(
        (course) =>
          course.dayOfWeek === selectedDay && isCourseActiveOnDate(course, selectedDateKey),
      )
      .map(toCourseSession)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [registeredCourses, selectedDateKey, selectedDay]);

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

  const weekRangeLabel = useMemo(() => {
    const start = weekDays[0]?.date;
    const end = weekDays[6]?.date;
    if (!start || !end) {
      return '';
    }
    const formatDay = (date: Date) =>
      new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
    return `${formatDay(start)} – ${formatDay(end)}`;
  }, [weekDays]);

  const monthCells = useMemo(() => {
    const gridStart = getMonthGridStart(activeYear, activeMonth);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);

      const academicDay = mapJsDayToAcademicDay(date.getDay());
      const isInMonth = date.getMonth() === activeMonth;
      const isWeekend = academicDay >= 6;
      const dateKey = toDateKey(date);
      const courseCount =
        isInMonth && !isWeekend
          ? registeredCourses.filter(
              (course) =>
                course.dayOfWeek === academicDay && isCourseActiveOnDate(course, dateKey),
            ).length
          : 0;

      return {
        date,
        academicDay,
        isInMonth,
        isWeekend,
        courseCount,
      };
    });
  }, [activeMonth, activeYear, registeredCourses]);

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

  const handleShiftWeek = (offset: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + offset * 7);
    setSelectedDate(nextDate);
    setSelectedDay(mapJsDayToAcademicDay(nextDate.getDay()));
    setSelectedWeek(getWeekOfMonth(nextDate));
    setCalendarAnchor(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
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
        source: 'personal',
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
            Personal Calendar
          </h2>
          <p className="text-xs text-slate-500">
            {registeredCourses.find((course) => isCourseActiveOnDate(course, selectedDateKey))
              ?.termDescription || 'Registered courses'}
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
            <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-1.5 py-1">
              <button
                type="button"
                onClick={() => handleShiftWeek(-1)}
                className="rounded-md p-1.5 text-slate-600 hover:bg-white hover:text-slate-900"
                aria-label="Previous week"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <p className="min-w-0 flex-1 text-center text-xs font-semibold text-slate-800">
                {weekRangeLabel}
              </p>
              <button
                type="button"
                onClick={() => handleShiftWeek(1)}
                className="rounded-md p-1.5 text-slate-600 hover:bg-white hover:text-slate-900"
                aria-label="Next week"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-200">
              {weekDays.map((item) => {
                const isSelected = selectedDay === item.day;
                const dateKey = toDateKey(item.date);
                const isHoliday = holidayByDate.has(dateKey);

                return (
                  <button
                    key={`${item.label}-${item.date.toISOString()}`}
                    type="button"
                    onClick={() => handleSelectDay(selectedWeek, item.day)}
                    title={holidayByDate.get(dateKey)}
                    className={`py-2 px-1 rounded-lg flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-xs font-bold'
                        : isHoliday
                          ? 'bg-red-50 text-red-700 font-bold hover:bg-red-100'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    <span className="text-xs">{item.label}</span>
                    <span className={`text-[10px] mt-0.5 ${isHoliday && !isSelected ? 'text-red-600 font-bold' : 'opacity-85'}`}>
                      {item.date.getDate()}
                    </span>
                    {isHoliday && !isSelected ? (
                      <span className="mt-0.5 h-1 w-1 rounded-full bg-red-500" />
                    ) : null}
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
                const dateKey = toDateKey(cell.date);
                const holidayName = holidayByDate.get(dateKey);
                const isHoliday = Boolean(holidayName);

                return (
                  <button
                    key={cell.date.toISOString()}
                    type="button"
                    onClick={() => handleSelectMonthCell(cell.date, cell.academicDay)}
                    disabled={!cell.isInMonth}
                    title={holidayName}
                    className={`min-h-[3.25rem] rounded-lg border px-1 py-1 text-left transition ${
                      isSelected
                        ? 'border-red-500 bg-red-100'
                        : isHoliday && cell.isInMonth
                          ? 'border-red-300 bg-red-50 hover:border-red-400'
                          : cell.isInMonth
                            ? 'border-slate-200 bg-white hover:border-slate-300'
                            : 'border-slate-100 bg-slate-50 text-slate-300'
                    }`}
                  >
                    <span
                      className={`block text-[10px] font-semibold ${
                        !cell.isInMonth
                          ? 'text-slate-300'
                          : isHoliday
                            ? 'text-red-700'
                            : 'text-slate-700'
                      }`}
                    >
                      {cell.date.getDate()}
                    </span>
                    {isHoliday && cell.isInMonth ? (
                      <span className="mt-0.5 block truncate text-[8px] font-bold leading-tight text-red-600">
                        PH
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <p className="px-1 text-[10px] text-slate-500">
              <span className="font-semibold text-red-600">Red dates</span> = Hong Kong public holidays
            </p>
          </div>
        )}
      </div>

      <div className="px-1 space-y-1">
        <p className="text-xs text-slate-600">
          Showing classes for <span className="font-bold text-slate-900">{selectedDateLabel}</span>
        </p>
        {selectedHolidayName ? (
          <p className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
            Public holiday · {selectedHolidayName}
          </p>
        ) : null}
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
                {/* <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                  Attendance: {course.attendanceRate}%
                </span> */}
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
                  <span className="text-slate-500 font-medium">Pending Assignments</span>
                  <span className="font-bold text-amber-700">{activeCourse.assignmentsDue} Tasks</span>
                </div>
              </div>

              {/* <div className="p-3 bg-red-50/60 rounded-xl space-y-1 border border-red-100">
                <span className="font-bold text-red-700 block">
                  Campus Navigation Tip
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Head to {activeCourse.building}, take the central lift to the designated floor. Tap your Student e-Card at the entrance reader to register attendance.
                </p>
              </div> */}
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

      {/* Moodle tasks + personal reminders */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded-md bg-indigo-50 text-indigo-600">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">
              Moodle Tasks & Personal Reminders
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-slate-500">
            {selectedDayTasks.filter((t) => !t.done).length} pending
          </span>
        </div>

        {/* <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
            <BookOpen className="h-3 w-3" />
            Moodle
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
            <Bell className="h-3 w-3" />
            Personal
          </span>
        </div> */}

        <div className="space-y-2">
          {selectedDayTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-500">
              No reminders for this day yet.
            </div>
          ) : (
            selectedDayTasks.map((task) => {
              const isPersonal = task.source === 'personal';
              return (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition border ${
                    isPersonal
                      ? 'bg-amber-50/80 border-amber-200 hover:border-amber-300'
                      : 'bg-indigo-50/70 border-indigo-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate mr-2">
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                        task.done
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : isPersonal
                            ? 'border-amber-300 bg-white'
                            : 'border-indigo-300 bg-white'
                      }`}
                    >
                      {task.done && <Check className="w-3 h-3" />}
                    </div>
                    <div className="min-w-0">
                      <div className="mb-0.5 flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                            isPersonal
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {isPersonal ? 'Personal' : 'Moodle'}
                        </span>
                      </div>
                      <span
                        className={`text-xs truncate font-medium block ${
                          task.done ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {task.text}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-semibold shrink-0 ${
                      isPersonal ? 'text-amber-700' : 'text-indigo-700'
                    }`}
                  >
                    {formatReminderDateTime(task.reminderDateTime)}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={handleAddTask} className="space-y-2 pt-1">
          <input
            type="text"
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            placeholder="Add personal reminder..."
            className="w-full bg-amber-50/60 text-xs text-slate-800 px-3 py-2 rounded-xl border border-amber-200 focus:outline-none focus:border-amber-500"
          />
          <div className="flex items-center space-x-2">
            <input
              type="time"
              value={newTaskTime}
              onChange={(e) => setNewTaskTime(e.target.value)}
              className="w-28 bg-amber-50/60 text-xs text-slate-800 px-2.5 py-2 rounded-xl border border-amber-200 focus:outline-none focus:border-amber-500"
              aria-label="Reminder time"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition shadow-xs"
              aria-label="Add personal reminder"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
