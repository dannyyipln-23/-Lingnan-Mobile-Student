import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  ChevronRight,
  Plus,
  Check,
  X
} from 'lucide-react';
import { COURSES } from '../data/mockData';
import { CourseSession } from '../types';

export const TimetableTab: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<number>(1); // 1 = Monday
  const [activeCourse, setActiveCourse] = useState<CourseSession | null>(null);
  const [tasks, setTasks] = useState([
    { id: 't1', text: 'RIM2201 Case Study on Climate Risk Insurance', due: 'Tomorrow 23:59', done: false },
    { id: 't2', text: 'CDS2001 Python Pandas assignment submission', due: 'Friday 17:00', done: true },
  ]);
  const [newTaskInput, setNewTaskInput] = useState('');

  const days = [
    { num: 1, label: 'Mon' },
    { num: 2, label: 'Tue' },
    { num: 3, label: 'Wed' },
    { num: 4, label: 'Thu' },
    { num: 5, label: 'Fri' },
  ];

  const dayCourses = COURSES.filter((c) => c.dayOfWeek === selectedDay);

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    setTasks(prev => [
      ...prev,
      { id: `t-${Date.now()}`, text: newTaskInput.trim(), due: 'Upcoming', done: false },
    ]);
    setNewTaskInput('');
  };

  return (
    <div className="page-shell page-shell--timetable space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Course Schedule & Timetable
          </h2>
          <p className="text-xs text-slate-500">
            2025/2026 Academic Year • Term 1
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="inline-flex whitespace-nowrap text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
            15 Credits (5 Courses)
          </span>
        </div>
      </div>

      {/* Week Day Selector */}
      <div className="grid grid-cols-5 gap-1.5 p-1 bg-white rounded-2xl border border-slate-200 shadow-xs">
        {days.map((day) => {
          const isSelected = selectedDay === day.num;
          const count = COURSES.filter((c) => c.dayOfWeek === day.num).length;
          return (
            <button
              key={day.num}
              type="button"
              onClick={() => setSelectedDay(day.num)}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-red-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="text-xs">{day.label}</span>
              <span className="text-[10px] mt-0.5 opacity-85">
                {count > 0 ? `${count} cl` : '-'}
              </span>
            </button>
          );
        })}
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
            {tasks.filter(t => !t.done).length} pending
          </span>
        </div>

        <div className="space-y-2">
          {tasks.map((task) => (
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
                {task.due}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddTask} className="flex items-center space-x-2 pt-1">
          <input
            type="text"
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            placeholder="Add personal study task or deadline..."
            className="flex-1 bg-slate-50 text-xs text-slate-800 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
