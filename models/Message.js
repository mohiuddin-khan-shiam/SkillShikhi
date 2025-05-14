import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  flags: [{
    type: String,
    enum: ['spam', 'offensive', 'inappropriate', 'other'],
  }],
  reports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
  }],
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
