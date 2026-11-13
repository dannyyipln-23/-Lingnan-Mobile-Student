import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
  BookOpen,
  Bell,
  Plus,
  Check,
  ExternalLink,
  X,
} from 'lucide-react';
import { STUDY_TASKS, StudyTaskSource } from '../data/mockData';
import { CourseSession } from '../types';
import { useAppPreferences } from '../context/AppPreferencesContext';
import { formatDateKey, getToday, toAcademicDay } from '../lib/appDate';
import { fetchHkPublicHolidays, holidayMapFromList } from '../lib/hkPublicHolidays';
import {
  fetchMoodleAssignmentTasks,
  MoodleAssignmentTask,
} from '../lib/moodleAssignmentTimeline';
import {
  fetchScheduledRegisteredCourses,
  getScheduledCoursesForDate,
  isScheduledCourseActiveOnDate,
  toScheduledCourseSession,
} from '../lib/registeredCourseMeetings';
import { fetchRegisteredCourses, RegisteredCourse } from '../lib/registeredCourses';

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

const buildReminderDateTime = (date: Date, time: string): string =>
  `${formatDateKey(date)}T${time}`;

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
  const { openInAppBrowser } = useAppPreferences();
  const initialSelectedDate = getToday();
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [calendarAnchor, setCalendarAnchor] = useState<Date>(
    new Date(initialSelectedDate.getFullYear(), initialSelectedDate.getMonth(), 1),
  );
  const [selectedWeek, setSelectedWeek] = useState<number>(getWeekOfMonth(initialSelectedDate));
  const [selectedDay, setSelectedDay] = useState<number>(toAcademicDay(initialSelectedDate));
  const [selectedDate, setSelectedDate] = useState<Date>(initialSelectedDate);
  const [activeCourse, setActiveCourse] = useState<CourseSession | null>(null);
  const [activeMoodleTask, setActiveMoodleTask] = useState<MoodleAssignmentTask | null>(null);
  const [moodleTasks, setMoodleTasks] = useState<MoodleAssignmentTask[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>(() =>
    STUDY_TASKS.filter((task) => task.source === 'personal').map((task) => ({ ...task })),
  );
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('18:00');
  const [holidayByDate, setHolidayByDate] = useState<Map<string, string>>(new Map());
  const [registeredCourses, setRegisteredCourses] = useState<RegisteredCourse[]>([]);

  const activeYear = calendarAnchor.getFullYear();
  const activeMonth = calendarAnchor.getMonth();

  useEffect(() => {
    let cancelled = false;
    void fetchScheduledRegisteredCourses()
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
    void (async () => {
      try {
        const courses = await fetchRegisteredCourses();
        const nextMoodleTasks = await fetchMoodleAssignmentTasks(courses);
        if (!cancelled) {
          setMoodleTasks(nextMoodleTasks);
        }
      } catch {
        if (!cancelled) {
          setMoodleTasks([]);
        }
      }
    })();
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

  const selectedDateKey = useMemo(() => formatDateKey(selectedDate), [selectedDate]);
  const selectedHolidayName = holidayByDate.get(selectedDateKey);
  const selectedMoodleTasks = useMemo(
    () => moodleTasks.filter((task) => task.dateKey === selectedDateKey),
    [moodleTasks, selectedDateKey],
  );
  const selectedPersonalTasks = useMemo(
    () => tasks.filter((task) => task.source === 'personal' && task.dateKey === selectedDateKey),
    [selectedDateKey, tasks],
  );

  const dayCourses = useMemo(
    () => getScheduledCoursesForDate(registeredCourses, selectedDate).map(toScheduledCourseSession),
    [registeredCourses, selectedDate],
  );

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(calendarAnchor),
    [calendarAnchor],
  );

  const holidayTitleFor = (date: Date, dateKey: string): string | undefined => {
    const named = holidayByDate.get(dateKey);
    if (named) return named;
    if (toAcademicDay(date) === 7) return 'Sunday';
    return undefined;
  };

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

      const academicDay = toAcademicDay(date);
      const isInMonth = date.getMonth() === activeMonth;
      const isWeekend = academicDay >= 6;
      const dateKey = formatDateKey(date);
      const courseCount =
        isInMonth && !isWeekend
          ? registeredCourses.filter(
              (course) =>
                course.dayOfWeek === academicDay &&
                isScheduledCourseActiveOnDate(course, dateKey),
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

  const handlePickDate = (value: string) => {
    if (!value) return;
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return;

    const nextDate = new Date(year, month - 1, day);
    setSelectedDate(nextDate);
    setSelectedDay(toAcademicDay(nextDate));
    setSelectedWeek(getWeekOfMonth(nextDate));
    setCalendarAnchor(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
  };

  const handleShiftWeek = (offset: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + offset * 7);
    setSelectedDate(nextDate);
    setSelectedDay(toAcademicDay(nextDate));
    setSelectedWeek(getWeekOfMonth(nextDate));
    setCalendarAnchor(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id && task.source === 'personal'
          ? { ...task, done: !task.done }
          : task,
      ),
    );
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
      <div className="cal-panel space-y-3">
        <div className="cal-toolbar">
          <div className="cal-segmented">
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`cal-segmented__btn${viewMode === 'week' ? ' is-active' : ''}`}
            >
              Weekly
            </button>
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`cal-segmented__btn${viewMode === 'month' ? ' is-active' : ''}`}
            >
              Monthly
            </button>
          </div>

          <label className="cal-nav-chip cal-date-picker">
            <CalendarIcon className="cal-date-picker__icon" aria-hidden />
            <span className="cal-nav-label cal-date-picker__label">{monthLabel}</span>
            <input
              type="date"
              className="cal-date-picker__input"
              value={selectedDateKey}
              onChange={(event) => handlePickDate(event.target.value)}
              aria-label="Jump to date"
            />
          </label>
        </div>

        {viewMode === 'week' ? (
          <>
            <div className="cal-week-nav">
              <button
                type="button"
                onClick={() => handleShiftWeek(-1)}
                className="cal-nav-btn cal-nav-btn--lg"
                aria-label="Previous week"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="cal-week-strip">
                {weekDays.map((item) => {
                  const isSelected = selectedDay === item.day;
                  const dateKey = formatDateKey(item.date);
                  const holidayTitle = holidayTitleFor(item.date, dateKey);
                  const isHoliday = Boolean(holidayTitle);

                  return (
                    <button
                      key={`${item.label}-${item.date.toISOString()}`}
                      type="button"
                      onClick={() => handleSelectDay(selectedWeek, item.day)}
                      title={holidayTitle}
                      className={`cal-week-day${isSelected ? ' is-selected' : ''}${
                        isHoliday && !isSelected ? ' is-holiday' : ''
                      }`}
                    >
                      <span className="cal-week-day__label">{item.label}</span>
                      <span
                        className={`cal-week-day__date${
                          isHoliday && !isSelected ? ' is-holiday' : ''
                        }`}
                      >
                        {item.date.getDate()}
                      </span>
                      {isHoliday && !isSelected ? <span className="cal-week-day__dot" /> : null}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => handleShiftWeek(1)}
                className="cal-nav-btn cal-nav-btn--lg"
                aria-label="Next week"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <div className="cal-month-head">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            <div className="cal-month-grid">
              {monthCells.map((cell) => {
                const isSelected = isSameDate(cell.date, selectedDate);
                const dateKey = formatDateKey(cell.date);
                const holidayTitle = holidayTitleFor(cell.date, dateKey);
                const isHoliday = Boolean(holidayTitle);

                return (
                  <button
                    key={cell.date.toISOString()}
                    type="button"
                    onClick={() => handleSelectMonthCell(cell.date, cell.academicDay)}
                    disabled={!cell.isInMonth}
                    title={holidayTitle}
                    className={`cal-month-cell${isSelected ? ' is-selected' : ''}${
                      isHoliday && cell.isInMonth ? ' is-holiday' : ''
                    }${!cell.isInMonth ? ' is-out' : ''}`}
                  >
                    <span className="cal-month-cell__day">{cell.date.getDate()}</span>
                    {isHoliday && cell.isInMonth ? (
                      <span className="cal-month-cell__ph">PH</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>


      <div className="space-y-3">
        {dayCourses.length === 0 ? (
          <div className="cal-empty">
            <CalendarIcon className="cal-empty__icon" />
            <p className="cal-empty__title">No scheduled lectures on this day</p>
            <p className="cal-empty__hint">
              Take time for library study or attend campus ILP activities!
            </p>
          </div>
        ) : (
          dayCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => setActiveCourse(course)}
              className="cal-course-card"
            >
              <div className="cal-course-card__top">
                <div className="cal-course-card__lead">
                  <div
                    className="cal-course-card__bar"
                    style={{ backgroundColor: course.color }}
                  />
                  <div>
                    <div className="cal-course-card__meta">
                      <span className="cal-course-card__code">{course.courseCode}</span>
                      <span className="cal-course-card__section">{course.section}</span>
                    </div>
                    <h3 className="cal-course-card__title">{course.courseName}</h3>
                  </div>
                </div>
                <span className="cal-course-card__time">
                  {course.startTime} - {course.endTime}
                </span>
              </div>

            </div>
          ))
        )}
      </div>

      {activeCourse && (
        <div className="cal-modal">
          <div className="cal-modal__sheet space-y-4">
            <div className="cal-modal__head">
              <div>
                <span className="cal-modal__badge">
                  {activeCourse.courseCode} • {activeCourse.section}
                </span>
                <h3 className="cal-modal__title">{activeCourse.courseName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveCourse(null)}
                className="cal-modal__close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="cal-modal__body">
              <div className="cal-modal__box">
                <div className="cal-modal__row">
                  <span className="cal-modal__label">Classroom Venue</span>
                  <span className="cal-modal__value">{activeCourse.venue}</span>
                </div>
                <div className="cal-modal__row">
                  <span className="cal-modal__label">Instructor</span>
                  <span className="cal-modal__value">{activeCourse.instructor}</span>
                </div>
                <div className="cal-modal__row">
                  <span className="cal-modal__label">Pending Assignments</span>
                  <span className="cal-modal__value cal-modal__value--warn">
                    {activeCourse.assignmentsDue} Tasks
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveCourse(null)}
              className="cal-modal__done"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {activeMoodleTask && (
        <div className="cal-modal" onClick={() => setActiveMoodleTask(null)}>
          <div
            className="cal-modal__sheet space-y-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cal-modal__head">
              <div>
                <span className="cal-modal__badge cal-modal__badge--moodle">
                  {activeMoodleTask.courseCode} · CRN {activeMoodleTask.crn}
                </span>
                <h3 className="cal-modal__title">{activeMoodleTask.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveMoodleTask(null)}
                className="cal-modal__close"
                aria-label="Close Moodle task details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="cal-modal__body">
              <div className="cal-modal__box">
                <div className="cal-modal__row">
                  <span className="cal-modal__label">Course</span>
                  <span className="cal-modal__value">{activeMoodleTask.courseName}</span>
                </div>
                <div className="cal-modal__row">
                  <span className="cal-modal__label">Type</span>
                  <span className="cal-modal__value">{activeMoodleTask.moduleName}</span>
                </div>
                <div className="cal-modal__row">
                  <span className="cal-modal__label">Status</span>
                  <span
                    className={`cal-modal__value${
                      activeMoodleTask.overdue ? ' cal-modal__value--warn' : ''
                    }`}
                  >
                    {activeMoodleTask.overdue
                      ? 'Overdue'
                      : activeMoodleTask.activityLabel || 'Due'}
                  </span>
                </div>
                <div className="cal-modal__row">
                  <span className="cal-modal__label">Due</span>
                  <span className="cal-modal__value">
                    {formatReminderDateTime(activeMoodleTask.reminderDateTime)}
                  </span>
                </div>
                <div className="cal-modal__row">
                  <span className="cal-modal__label">Term</span>
                  <span className="cal-modal__value">{activeMoodleTask.termLabel}</span>
                </div>
                {activeMoodleTask.courseShortname ? (
                  <div className="cal-modal__row">
                    <span className="cal-modal__label">Section</span>
                    <span className="cal-modal__value">{activeMoodleTask.courseShortname}</span>
                  </div>
                ) : null}
              </div>
            </div>

            {activeMoodleTask.url ? (
              <button
                type="button"
                className="cal-modal__link"
                onClick={() =>
                  openInAppBrowser(activeMoodleTask.url!, activeMoodleTask.title)
                }
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open in Moodle
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setActiveMoodleTask(null)}
              className="cal-modal__done"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="cal-panel cal-panel--tasks space-y-3">
        <div className="cal-tasks__head">
          <div className="cal-tasks__title-wrap">
            <div className="cal-tasks__icon cal-tasks__icon--moodle">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="cal-tasks__title">Moodle Tasks</h3>
          </div>
          <span className="cal-tasks__pending">{selectedMoodleTasks.length} due</span>
        </div>

        <div className="space-y-2">
          {selectedMoodleTasks.length === 0 ? (
            <div className="cal-tasks__empty">No Moodle tasks for this day.</div>
          ) : (
            selectedMoodleTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => setActiveMoodleTask(task)}
                className="cal-task cal-task--moodle cal-task--clickable"
              >
                <div className="cal-task__main">
                  <span className="cal-task__text">{task.text}</span>
                </div>
                <span className="cal-task__time cal-task__time--moodle">
                  {formatReminderDateTime(task.reminderDateTime)}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="cal-panel cal-panel--tasks space-y-3">
        <div className="cal-tasks__head">
          <div className="cal-tasks__title-wrap">
            <div className="cal-tasks__icon cal-tasks__icon--personal">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="cal-tasks__title">Personal Reminders</h3>
          </div>
          <span className="cal-tasks__pending">
            {selectedPersonalTasks.filter((task) => !task.done).length} pending
          </span>
        </div>

        <div className="space-y-2">
          {selectedPersonalTasks.length === 0 ? (
            <div className="cal-tasks__empty">No personal reminders for this day yet.</div>
          ) : (
            selectedPersonalTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className="cal-task cal-task--personal"
              >
                <div className="cal-task__main">
                  <div className={`cal-task__check${task.done ? ' is-done' : ''}`}>
                    {task.done && <Check className="w-3 h-3" />}
                  </div>
                  <span className={`cal-task__text${task.done ? ' is-done' : ''}`}>
                    {task.text}
                  </span>
                </div>
                <span className="cal-task__time cal-task__time--personal">
                  {formatReminderDateTime(task.reminderDateTime)}
                </span>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddTask} className="cal-task-form">
          <input
            type="text"
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            placeholder="Add personal reminder..."
            className="cal-task-form__input"
          />
          <div className="cal-task-form__row">
            <input
              type="time"
              value={newTaskTime}
              onChange={(e) => setNewTaskTime(e.target.value)}
              className="cal-task-form__time"
              aria-label="Reminder time"
            />
            <button
              type="submit"
              className="cal-task-form__submit"
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
