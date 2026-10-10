import mongoose from 'mongoose';

const availabilityExceptionSchema = new mongoose.Schema({
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: { type: String, required: true }, // Format "YYYY-MM-DD"
  type: {
    type: String,
    enum: ['UNAVAILABLE', 'SPECIAL_HOURS', 'BLOCKED'],
    default: 'UNAVAILABLE',
  },
  intervals: [{
    startTime: { type: String },
    endTime: { type: String },
  }],
}, { timestamps: true });

const AvailabilityException = mongoose.models.AvailabilityException || mongoose.model('AvailabilityException', availabilityExceptionSchema);
export default AvailabilityException;
