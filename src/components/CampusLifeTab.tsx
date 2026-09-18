import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Bus, 
  MapPin, 
  Clock, 
  Users, 
  ChevronRight, 
  Sparkles, 
  Check, 
  Calendar,
  UtensilsCrossed
} from 'lucide-react';
import { ILP_DATA, CAMPUS_FACILITIES } from '../data/mockData';

interface CampusLifeTabProps {
  onOpenLibraryModal: () => void;
}

export const CampusLifeTab: React.FC<CampusLifeTabProps> = ({ onOpenLibraryModal }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'ilp' | 'facilities' | 'bus'>('all');
  const [registeredEvents, setRegisteredEvents] = useState<Record<string, boolean>>({});
  const [toastText, setToastText] = useState<string | null>(null);

  const ilpWorkshops = [
    {
      id: 'ilp-w1',
      title: 'Liberal Arts Leadership & AI Ethics Seminar',
      category: 'Intellectual Development',
      units: 2,
      date: 'Next Tuesday 14:30',
      venue: 'MBG22 (Main Building)',
      quota: '18 / 60 seats left',
    },
    {
      id: 'ilp-w2',
      title: 'Lingnan Heritage Walking Tour & Red-Grey Traditions',
      category: 'Civic Education',
      units: 3,
      date: 'Saturday 10:00',
      venue: 'Campus Memorial Archway',
      quota: '8 / 25 seats left',
    },
    {
      id: 'ilp-w3',
      title: 'Inter-Hall Intramural Badminton Tournament',
      category: 'Physical Education',
      units: 2,
      date: 'Thursday 18:00',
      venue: 'Jackie Chan Gymnasium',
      quota: 'Open registration',
    },
  ];

  const handleRegisterILP = (id: string, title: string) => {
    setRegisteredEvents(prev => ({ ...prev, [id]: true }));
    setToastText(`Successfully enrolled in: ${title} (+units reserved)`);
    setTimeout(() => setToastText(null), 3000);
  };

  return (
    <div className="space-y-4 pb-24 text-slate-800">
      {/* Toast */}
      {toastText && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg flex items-center space-x-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toastText}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Campus Life & Student Facilities
          </h2>
          <p className="text-xs text-slate-500">
            ILP Graduation Units, Library and Student Facilities
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex space-x-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'All Services' },
          { id: 'ilp', label: 'ILP Units' },
          { id: 'facilities', label: 'Study & Facilities' },
          { id: 'bus', label: 'Shuttle Info' },
        ].map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition ${
              activeCategory === cat.id
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ILP Breakdown (Shown if 'all' or 'ilp') */}
      {(activeCategory === 'all' || activeCategory === 'ilp') && (
        <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  ILP Requirements (Graduation Criterion)
                </h3>
                <span className="text-[10px] text-slate-500 font-medium">
                  Mandatory 75 Units for Undergraduate Degree
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Fulfilled 112%
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {ILP_DATA.map(item => {
              const pct = Math.min(100, Math.round((item.earnedUnits / item.requiredUnits) * 100));
              return (
                <div key={item.category} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800">
                      {item.category}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-600">
                      {item.earnedUnits} / {item.requiredUnits} units
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Upcoming ILP workshops */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Enroll in Upcoming ILP Activities
            </h4>
            <div className="space-y-2">
              {ilpWorkshops.map(w => (
                <div key={w.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="space-y-0.5 mr-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">
                      +{w.units} units • {w.category}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 mt-1">
                      {w.title}
                    </h5>
                    <p className="text-[10px] text-slate-500">
                      {w.date} • {w.venue}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRegisterILP(w.id, w.title)}
                    disabled={registeredEvents[w.id]}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                      registeredEvents[w.id]
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                    }`}
                  >
                    {registeredEvents[w.id] ? 'Enrolled' : 'Register'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Shuttle Bus (Shown if 'all' or 'bus') */}
      {(activeCategory === 'all' || activeCategory === 'bus') && (
        <div className="rounded-2xl bg-gradient-to-r from-red-50/70 via-white to-slate-50 border border-red-200 p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center">
                <Bus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  Campus Shuttle Snapshot
                </h3>
                <span className="text-[10px] text-slate-500">
                  For full live feeds, use the Shuttle tab
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
              LIVE
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
              <span className="text-[10px] text-slate-500 block font-medium">Next Bus</span>
              <span className="text-base font-extrabold text-red-600 font-mono">4 mins</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
              <span className="text-[10px] text-slate-500 block font-medium">Following</span>
              <span className="text-base font-extrabold text-slate-700 font-mono">12 mins</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
              <span className="text-[10px] text-slate-500 block font-medium">Last Departure</span>
              <span className="text-base font-extrabold text-slate-700 font-mono">23:15</span>
            </div>
          </div>
        </div>
      )}

      {/* Facilities & Study Spaces (Shown if 'all' or 'facilities') */}
      {(activeCategory === 'all' || activeCategory === 'facilities') && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Study Spaces & Recreation Facilities
          </h3>

          <div className="space-y-3">
            {CAMPUS_FACILITIES.map(fac => (
              <div
                key={fac.id}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs"
              >
                <div className="relative h-28 w-full bg-slate-100">
                  <img
                    src={fac.imageUrl}
                    alt={fac.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 border border-slate-200 shadow-xs">
                    {fac.openHours}
                  </span>
                </div>

                <div className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {fac.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-red-600" />
                        <span>{fac.location}</span>
                      </p>
                    </div>

                    {fac.category === 'library' && (
                      <button
                        type="button"
                        onClick={onOpenLibraryModal}
                        className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition"
                      >
                        Book Seat
                      </button>
                    )}
                  </div>

                  {fac.availableSeats !== undefined && (
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                      <span className="text-slate-500">Live Available Desks</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {fac.availableSeats} / {fac.totalSeats} seats
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
