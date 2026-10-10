import mongoose from 'mongoose';

const therapistProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  specialization: { type: String, required: true },
  experienceYears: { type: Number, default: 5 },
  qualifications: [{ type: String }],
  languages: [{ type: String }],
  consultationModes: [{ type: String, enum: ['ONLINE', 'IN_PERSON'] }],
  clinic: { type: String, default: 'KineticCare Digital Health Center' },
  bio: { type: String, default: '' },
  rating: { type: Number, default: 4.8 },
  totalPatients: { type: Number, default: 0 },
}, { timestamps: true });

const TherapistProfile = mongoose.models.TherapistProfile || mongoose.model('TherapistProfile', therapistProfileSchema);
export default TherapistProfile;
