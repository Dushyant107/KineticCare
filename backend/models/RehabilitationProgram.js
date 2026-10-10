import mongoose from 'mongoose';

const programExerciseSchema = new mongoose.Schema({
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true,
  },
  exerciseSlug: { type: String, required: true },
  exerciseName: { type: String, required: true },
  sets: { type: Number, default: 3 },
  reps: { type: Number, default: 10 },
  durationSeconds: { type: Number, default: 0 },
  targetROM: { type: Number, default: 90 },
  frequency: { type: String, default: 'Daily' },
  instructions: { type: String, default: '' },
}, { _id: false });

const rehabilitationProgramSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  goal: { type: String, default: 'Knee rehabilitation' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'ACTIVE', 'COMPLETED', 'PAUSED'],
    default: 'ACTIVE',
  },
  exercises: [programExerciseSchema],
}, { timestamps: true });

const RehabilitationProgram = mongoose.models.RehabilitationProgram || mongoose.model('RehabilitationProgram', rehabilitationProgramSchema);
export default RehabilitationProgram;
