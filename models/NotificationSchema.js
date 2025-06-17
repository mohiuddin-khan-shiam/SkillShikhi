import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['friend_request', 'friend_accepted', 'system', 'unfriend', 'friend_rejected', 'message', 'teaching_request'],
    required: true
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default NotificationSchema; 