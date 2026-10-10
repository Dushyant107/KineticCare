import TherapistAvailability from '../models/TherapistAvailability.js';
import AvailabilityException from '../models/AvailabilityException.js';
import Appointment from '../models/Appointment.js';

export const generateAvailableSlots = async (therapistId, dateString) => {
  // dateString: "YYYY-MM-DD"
  const dateObj = new Date(dateString + 'T00:00:00');
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = daysOfWeek[dateObj.getDay()];

  // Check exceptions first
  const exception = await AvailabilityException.findOne({ therapistId, date: dateString });
  if (exception) {
    if (exception.type === 'UNAVAILABLE' || exception.type === 'BLOCKED') {
      return [];
    }
  }

  // Get regular weekly availability
  const availability = await TherapistAvailability.findOne({ therapistId, dayOfWeek: dayName });
  if (!availability || !availability.enabled || !availability.intervals || availability.intervals.length === 0) {
    return [];
  }

  const slotDuration = availability.slotDurationMinutes || 30;
  const buffer = availability.bufferMinutes || 10;
  const intervals = (exception && exception.type === 'SPECIAL_HOURS') ? exception.intervals : availability.intervals;

  const generatedSlots = [];

  for (const interval of intervals) {
    const [startH, startM] = interval.startTime.split(':').map(Number);
    const [endH, endM] = interval.endTime.split(':').map(Number);

    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    while (currentMinutes + slotDuration <= endMinutes) {
      const sH = String(Math.floor(currentMinutes / 60)).padStart(2, '0');
      const sM = String(currentMinutes % 60).padStart(2, '0');
      const slotStart = `${sH}:${sM}`;

      const eMin = currentMinutes + slotDuration;
      const eH = String(Math.floor(eMin / 60)).padStart(2, '0');
      const eM = String(eMin % 60).padStart(2, '0');
      const slotEnd = `${eH}:${eM}`;

      generatedSlots.push({
        startTime: slotStart,
        endTime: slotEnd,
        date: dateString,
      });

      currentMinutes += slotDuration + buffer;
    }
  }

  // Fetch booked appointments for this therapist and date
  const bookedAppointments = await Appointment.find({
    therapistId,
    date: dateString,
    status: { $ne: 'CANCELLED' },
  });

  const bookedTimes = new Set(bookedAppointments.map(app => app.startTime));

  // Filter out booked slots
  return generatedSlots.map(slot => ({
    ...slot,
    available: !bookedTimes.has(slot.startTime),
  }));
};
