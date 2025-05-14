import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['system', 'friend_request', 'message', 'teaching_request', 'moderation', 'session', 'content'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Optional reference to related entity
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },
  relatedModel: {
    type: String,
    enum: ['User', 'Post', 'Comment', 'Message', 'TeachingRequest', 'Session']
  },
  // Additional metadata
  metadata: {
    type: Object
  }
});

// Add indexes for better query performance
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ createdAt: -1 });

// Create a TTL index to automatically delete old notifications after 30 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Check if the model already exists to prevent model overwrite error during hot reloading
const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

export default Notification;
