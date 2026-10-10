import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
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
  lastMessage: { type: String, default: '' },
  lastMessageTime: { type: Date, default: Date.now },
}, { timestamps: true });

conversationSchema.index({ patientId: 1, therapistId: 1 }, { unique: true });

const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
export default Conversation;
