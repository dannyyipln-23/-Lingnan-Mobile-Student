import React, { useState } from 'react';
import { BookOpen, Check, Clock, MapPin, X, Users } from 'lucide-react';
import { CURRENT_STUDENT } from '../data/mockData';

interface LibraryBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LibraryBookingModal: React.FC<LibraryBookingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFloor, setSelectedFloor] = useState<string>('1F');
  const [selectedRoom, setSelectedRoom] = useState<string>('Seat #142 (Window Desk with Power Socket & Reading Lamp)');
  const [selectedTime, setSelectedTime] = useState<string>('14:00 - 16:00 (Today)');
  const [isBooked, setIsBooked] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setIsBooked(true);
    setTimeout(() => {
      setIsBooked(false);
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto text-slate-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Fong Sum Wood Library • Seat Reservation
              </h3>
              <p className="text-[10px] text-slate-500">
                Check in with Student e-Card or QR Code within 15 mins
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

        {isBooked ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-4 ring-emerald-50 animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Seat Reservation Confirmed!
            </h4>
            <p className="text-xs text-slate-600">
              {selectedRoom} • {selectedTime}
            </p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Please tap your Student e-Card at the desk sensor within 15 minutes of reservation start time.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Floor selector */}
            <div>
              <label className="text-slate-600 font-bold block mb-1.5">
                Select Library Floor Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'GF', label: 'G/F Commons', desks: '48 free' },
                  { id: '1F', label: '1/F Quiet Study', desks: '82 free' },
                  { id: '2F', label: '2/F Group Rooms', desks: '12 free' },
                ].map((fl) => (
                  <button
                    key={fl.id}
                    type="button"
                    onClick={() => setSelectedFloor(fl.id)}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      selectedFloor === fl.id
                        ? 'bg-red-600 border-red-600 text-white font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-xs">{fl.label}</span>
                    <span className="text-[10px] opacity-80">{fl.desks}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Room / Desk selector */}
            <div>
              <label className="text-slate-600 font-bold block mb-1.5">
                Select Study Carrel / Discussion Room
              </label>
              <div className="space-y-1.5">
                {[
                  'Seat #142 (Window Desk with Power Socket & Reading Lamp)',
                  'Seat #148 (Single Study Carrel - Silent Reading Zone)',
                  'Group Study Room 204 (4-6 Persons with 4K Display Screen)',
                ].map((seat) => (
                  <div
                    key={seat}
                    onClick={() => setSelectedRoom(seat)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      selectedRoom === seat
                        ? 'bg-red-50 border-red-400 text-red-900 font-medium'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate pr-2">{seat}</span>
                    {selectedRoom === seat && <Check className="w-4 h-4 text-red-600 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Time slot selector */}
            <div>
              <label className="text-slate-600 font-bold block mb-1.5">
                Reservation Time Slot (Maximum 2 Hours)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  '14:00 - 16:00 (Today)',
                  '16:00 - 18:00 (Today)',
                  '18:30 - 20:30 (Tonight)',
                  '09:30 - 11:30 (Tomorrow)',
                ].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`p-2 rounded-xl border text-center transition text-[11px] font-medium ${
                      selectedTime === slot
                        ? 'bg-red-50 border-red-500 text-red-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Student info confirmation */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
              <span>Student: {CURRENT_STUDENT.fullName} ({CURRENT_STUDENT.studentNumber})</span>
              <span className="text-emerald-700 font-semibold">2 booking slots available</span>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition"
            >
              Confirm Library Seat Reservation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
