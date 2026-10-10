import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  bodyPart: { type: String, required: true }, // "Knee", "Arm", "Shoulder", "Full Body"
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  instructions: [{ type: String }],
  targetMuscles: [{ type: String }],
  equipment: { type: String, default: 'None' },
  targetROM: { type: Number, default: 90 },
  trackingEnabled: { type: Boolean, default: true },
}, { timestamps: true });

const Exercise = mongoose.models.Exercise || mongoose.model('Exercise', exerciseSchema);
export default Exercise;
