import mongoose from 'mongoose';

const dailyProgressSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: { type: String, required: true }, // Format "YYYY-MM-DD"
  sessionsCompleted: { type: Number, default: 0 },
  exercisesCompleted: { type: Number, default: 0 },
  totalReps: { type: Number, default: 0 },
  totalDurationSeconds: { type: Number, default: 0 },
  averageQuality: { type: Number, default: 0 },
  averageROM: { type: Number, default: 0 },
  bestROM: { type: Number, default: 0 },
  adherencePercentage: { type: Number, default: 0 },
  activeDay: { type: Boolean, default: true },
}, { timestamps: true });

dailyProgressSchema.index({ patientId: 1, date: 1 }, { unique: true });

const DailyProgress = mongoose.models.DailyProgress || mongoose.model('DailyProgress', dailyProgressSchema);
export default DailyProgress;
