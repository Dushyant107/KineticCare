import mongoose from 'mongoose';

const exerciseSessionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
  },
  exerciseSlug: { type: String, required: true },
  exerciseName: { type: String, required: true },
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RehabilitationProgram',
  },
  durationSeconds: { type: Number, default: 0 },
  targetReps: { type: Number, default: 10 },
  completedReps: { type: Number, default: 0 },
  averageROM: { type: Number, default: 0 },
  bestROM: { type: Number, default: 0 },
  qualityScore: { type: Number, default: 0 }, // 0 to 100
  feedbackEvents: [{ type: String }],
  therapistNote: { type: String, default: '' },
  completedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const ExerciseSession = mongoose.models.ExerciseSession || mongoose.model('ExerciseSession', exerciseSessionSchema);
export default ExerciseSession;
