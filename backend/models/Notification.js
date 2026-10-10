import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['PROGRAM_UPDATED', 'SESSION_COMPLETED', 'APPOINTMENT_REMINDER', 'NEW_MESSAGE', 'LOW_ADHERENCE', 'THERAPIST_NOTE', 'STREAK_MILESTONE'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  link: { type: String, default: '' },
}, { timestamps: true });

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export default Notification;
