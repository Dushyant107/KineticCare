import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const filter = req.user.role === 'THERAPIST' ? { therapistId: userId } : { patientId: userId };

    const conversations = await Conversation.find(filter)
      .populate('patientId', 'name email avatar')
      .populate('therapistId', 'name email avatar')
      .sort({ lastMessageTime: -1 });

    res.json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { recipientId, content } = req.body;

    if (!recipientId || !content) {
      return res.status(400).json({ success: false, message: 'Recipient and message content are required' });
    }

    const patientId = req.user.role === 'PATIENT' ? senderId : recipientId;
    const therapistId = req.user.role === 'THERAPIST' ? senderId : recipientId;

    let conversation = await Conversation.findOne({ patientId, therapistId });
    if (!conversation) {
      conversation = await Conversation.create({ patientId, therapistId, lastMessage: content, lastMessageTime: new Date() });
    } else {
      conversation.lastMessage = content;
      conversation.lastMessageTime = new Date();
      await conversation.save();
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      receiverId: recipientId,
      content,
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};
