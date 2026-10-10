import mongoose from 'mongoose';

const patientProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  age: { type: Number },
  gender: { type: String, default: 'Prefer not to say' },
  rehabilitationGoal: { type: String, default: 'Knee & Joint Recovery' },
  affectedAreas: [{ type: String }],
  conditionDescription: { type: String, default: '' },
  activityLevel: { type: String, default: 'Moderate' },
  exerciseFrequency: { type: String, default: '3-4 times per week' },
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: null },
  activeDaysCount: { type: Number, default: 0 },
  recoveryScore: { type: Number, default: 75, min: 0, max: 100 },
}, { timestamps: true });

const PatientProfile = mongoose.models.PatientProfile || mongoose.model('PatientProfile', patientProfileSchema);
export default PatientProfile;
