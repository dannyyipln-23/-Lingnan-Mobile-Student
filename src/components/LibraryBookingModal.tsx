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
    <div className="lib-overlay">
      <div className="lib-sheet">
        <div className="lib-head">
          <div className="lib-head__lead">
            <div className="lib-head__icon">
              <BookOpen className="lib-head__icon-svg" />
            </div>
            <div>
              <h3 className="lib-head__title">
                Fong Sum Wood Library • Seat Reservation
              </h3>
              <p className="lib-head__desc">
                Check in with Student e-Card or QR Code within 15 mins
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lib-close"
          >
            <X className="lib-close__icon" />
          </button>
        </div>

        {isBooked ? (
          <div className="lib-success">
            <div className="lib-success__icon">
              <Check className="lib-success__check" />
            </div>
            <h4 className="lib-success__title">
              Seat Reservation Confirmed!
            </h4>
            <p className="lib-success__meta">
              {selectedRoom} • {selectedTime}
            </p>
            <p className="lib-success__hint">
              Please tap your Student e-Card at the desk sensor within 15 minutes of reservation start time.
            </p>
          </div>
        ) : (
          <div className="lib-form">
            {/* Floor selector */}
            <div>
              <label className="lib-label">
                Select Library Floor Level
              </label>
              <div className="lib-floor-grid">
                {[
                  { id: 'GF', label: 'G/F Commons', desks: '48 free' },
                  { id: '1F', label: '1/F Quiet Study', desks: '82 free' },
                  { id: '2F', label: '2/F Group Rooms', desks: '12 free' },
                ].map((fl) => (
                  <button
                    key={fl.id}
                    type="button"
                    onClick={() => setSelectedFloor(fl.id)}
                    className={`lib-floor${selectedFloor === fl.id ? ' is-selected' : ''}`}
                  >
                    <span className="lib-floor__label">{fl.label}</span>
                    <span className="lib-floor__desks">{fl.desks}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Room / Desk selector */}
            <div>
              <label className="lib-label">
                Select Study Carrel / Discussion Room
              </label>
              <div className="lib-seats">
                {[
                  'Seat #142 (Window Desk with Power Socket & Reading Lamp)',
                  'Seat #148 (Single Study Carrel - Silent Reading Zone)',
                  'Group Study Room 204 (4-6 Persons with 4K Display Screen)',
                ].map((seat) => (
                  <div
                    key={seat}
                    onClick={() => setSelectedRoom(seat)}
                    className={`lib-seat${selectedRoom === seat ? ' is-selected' : ''}`}
                  >
                    <span className="lib-seat__text">{seat}</span>
                    {selectedRoom === seat && <Check className="lib-seat__check" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Time slot selector */}
            <div>
              <label className="lib-label">
                Reservation Time Slot (Maximum 2 Hours)
              </label>
              <div className="lib-slots">
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
                    className={`lib-slot${selectedTime === slot ? ' is-selected' : ''}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Student info confirmation */}
            <div className="lib-student">
              <span>Student: {CURRENT_STUDENT.fullName} ({CURRENT_STUDENT.studentNumber})</span>
              <span className="lib-student__avail">2 booking slots available</span>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              className="lib-confirm"
            >
              Confirm Library Seat Reservation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
