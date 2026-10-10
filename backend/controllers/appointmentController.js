import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import TherapistProfile from '../models/TherapistProfile.js';
import Notification from '../models/Notification.js';
import { generateAvailableSlots } from '../services/slotGenerator.js';

export const getSlots = async (req, res) => {
  try {
    const { therapistId, date } = req.query;
    if (!therapistId || !date) {
      return res.status(400).json({ success: false, message: 'therapistId and date are required' });
    }

    const slots = await generateAvailableSlots(therapistId, date);
    res.json({ success: true, date, therapistId, slots });
  } catch (error) {
    console.error('getSlots error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate appointment slots' });
  }
};

export const bookAppointment = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { therapistId, date, startTime, endTime, appointmentType = 'ONLINE', notes } = req.body;

    if (!therapistId || !date || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Missing required appointment details' });
    }

    // Verify therapist exists
    const therapist = await User.findById(therapistId);
    if (!therapist || therapist.role !== 'THERAPIST') {
      return res.status(400).json({ success: false, message: 'Invalid therapist selected' });
    }

    // Check for double booking
    const existing = await Appointment.findOne({
      therapistId,
      date,
      startTime,
      status: { $ne: 'CANCELLED' },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'This slot has already been booked. Please select another slot.' });
    }

    const appointment = await Appointment.create({
      patientId,
      therapistId,
      date,
      startTime,
      endTime,
      appointmentType,
      notes,
      status: 'CONFIRMED',
    });

    // Link patient to therapist if not already linked
    await PatientProfile.findOneAndUpdate(
      { userId: patientId },
      { therapistId },
      { upsert: true }
    );

    // Update therapist patient count
    await TherapistProfile.findOneAndUpdate(
      { userId: therapistId },
      { $inc: { totalPatients: 1 } }
    );

    // Create notifications for patient & therapist
    await Notification.create({
      userId: patientId,
      type: 'APPOINTMENT_REMINDER',
      title: 'Appointment Confirmed',
      message: `Your consultation with ${therapist.name} is confirmed for ${date} at ${startTime}.`,
    });

    await Notification.create({
      userId: therapistId,
      type: 'APPOINTMENT_REMINDER',
      title: 'New Patient Booking',
      message: `${req.user.name} booked a consultation for ${date} at ${startTime}.`,
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email avatar')
      .populate('therapistId', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error('bookAppointment error:', error);
    res.status(500).json({ success: false, message: 'Failed to book appointment' });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const filter = req.user.role === 'THERAPIST' ? { therapistId: userId } : { patientId: userId };

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name email avatar')
      .populate('therapistId', 'name email avatar')
      .sort({ date: -1, startTime: -1 });

    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (status) appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;

    await appointment.save();

    res.json({ success: true, message: `Appointment status updated to ${appointment.status}`, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update appointment status' });
  }
};
