import mongoose from 'mongoose';

const prescribedExerciseSchema = new mongoose.Schema({
  exerciseName: { type: String, required: true },
  sets: { type: Number, default: 3 },
  reps: { type: Number, default: 10 },
  targetROM: { type: Number, default: 90 },
  prescribedDurationMinutes: { type: Number, default: 15 },
}, { _id: false });

const reportSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  title: { type: String, required: true },
  dateRange: { type: String, default: 'Last 30 Days' },
  sessionsCompleted: { type: Number, default: 0 },
  adherenceRate: { type: Number, default: 0 },
  averageQuality: { type: Number, default: 0 },
  averageROM: { type: Number, default: 0 },
  recoveryScore: { type: Number, default: 0 },
  aiObservations: [{ type: String }],
  therapistNotes: { type: String, default: '' },
  prescribedExercises: [prescribedExerciseSchema],
  prescribedDailyDurationMinutes: { type: Number, default: 20 },
  status: { type: String, enum: ['DRAFT', 'PUBLISHED'], default: 'PUBLISHED' },
}, { timestamps: true });

const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);
export default Report;
