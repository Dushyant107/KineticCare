import mongoose from 'mongoose';

const intervalSchema = new mongoose.Schema({
  startTime: { type: String, required: true }, // e.g. "09:00"
  endTime: { type: String, required: true },   // e.g. "13:00"
}, { _id: false });

const therapistAvailabilitySchema = new mongoose.Schema({
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true,
  },
  enabled: { type: Boolean, default: true },
  intervals: [intervalSchema],
  slotDurationMinutes: { type: Number, default: 30 },
  bufferMinutes: { type: Number, default: 10 },
}, { timestamps: true });

therapistAvailabilitySchema.index({ therapistId: 1, dayOfWeek: 1 }, { unique: true });

const TherapistAvailability = mongoose.models.TherapistAvailability || mongoose.model('TherapistAvailability', therapistAvailabilitySchema);
export default TherapistAvailability;
