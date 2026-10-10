import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { Calendar, Clock, Video, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const BookAppointmentModal = ({ isOpen, onClose, therapist, onBooked }) => {
  const { API_BASE_URL } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointmentType, setAppointmentType] = useState('ONLINE');
  const [notes, setNotes] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const therapistUser = therapist?.user || therapist;
  const therapistId = therapistUser?._id || therapistUser?.id;

  useEffect(() => {
    if (isOpen && therapistId && selectedDate) {
      fetchSlots();
    }
  }, [isOpen, therapistId, selectedDate]);

  const fetchSlots = async () => {
    setLoadingSlots(true);
    setError('');
    setSelectedSlot(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/appointments/slots`, {
        params: { therapistId, date: selectedDate },
      });
      if (res.data.success) {
        setSlots(res.data.slots);
      }
    } catch (err) {
      console.error('Failed to load slots:', err);
      setError('Could not load appointment slots. Please try another date.');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) {
      setError('Please select an available appointment slot.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/appointments/book`, {
        therapistId,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        appointmentType,
        notes,
      });

      if (res.data.success) {
        if (onBooked) onBooked(res.data.appointment);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!therapist) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Rehabilitation Consultation"
      subtitle={`Schedule an appointment with ${therapistUser?.name}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Doctor Summary Card */}
        <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <img
            src={therapistUser?.avatar || 'https://images.unsplash.com/photo-1594824813566-88855ce7896c?w=150&auto=format&fit=crop&q=80'}
            alt={therapistUser?.name}
            className="w-12 h-12 rounded-full object-cover border border-slate-200"
          />
          <div>
            <h4 className="text-sm font-bold text-slate-900">{therapistUser?.name}</h4>
            <p className="text-xs text-sky-600 font-semibold">{therapist?.profile?.specialization || 'Physiotherapist'}</p>
            <p className="text-[10px] text-slate-500">{therapist?.profile?.clinic || 'KineticCare Digital Health'}</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-lg text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Date Selection */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
            1. Select Consultation Date
          </label>
          <input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full h-10 px-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Generated Slots */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
            2. Select Available Time Slot
          </label>
          {loadingSlots ? (
            <div className="py-6 text-center text-xs text-slate-400">Loading available slots...</div>
          ) : slots.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
              No available slots on this date. Please select another working day.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {slots.map((slot) => {
                const isSelected = selectedSlot?.startTime === slot.startTime;
                const isBooked = !slot.available;
                return (
                  <button
                    key={slot.startTime}
                    disabled={isBooked}
                    onClick={() => setSelectedSlot(slot)}
                    title={isBooked ? 'Slot covered / already booked' : `Select ${slot.startTime} - ${slot.endTime}`}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isBooked
                        ? 'bg-slate-200/90 border-slate-300 text-slate-500 line-through cursor-not-allowed font-medium'
                        : isSelected
                        ? 'bg-sky-600 border-sky-600 text-white shadow-sm font-bold ring-2 ring-sky-300'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-sky-400 hover:bg-sky-50'
                    }`}
                  >
                    <span>{slot.startTime}</span>
                    <span className="text-[10px] font-normal opacity-80 mt-0.5">
                      {isBooked ? 'Booked' : `${slot.endTime}`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Consultation Mode */}
        <div>
          <Select
            label="3. Consultation Type"
            value={appointmentType}
            onChange={(e) => setAppointmentType(e.target.value)}
            options={[
              { value: 'ONLINE', label: 'Online Video Consultation' },
              { value: 'IN_PERSON', label: 'In-Person Clinic Visit' },
            ]}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
            4. Clinical Notes / Symptoms (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe your current knee mobility or recovery concerns..."
            className="w-full p-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* CTA */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleBooking}
            isLoading={isSubmitting}
            disabled={!selectedSlot}
            icon={UserCheck}
          >
            Confirm Booking
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BookAppointmentModal;
