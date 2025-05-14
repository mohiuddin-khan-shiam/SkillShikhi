import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  device: {
    type: String,
  },
  location: {
    type: String,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  activityCount: {
    type: Number,
    default: 0,
  },
  terminatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  terminationReason: {
    type: String,
  },
  flags: {
    type: [String],
    default: [],
  },
});

// Add indexes for efficient querying
SessionSchema.index({ userId: 1 });
SessionSchema.index({ isActive: 1 });
SessionSchema.index({ startTime: -1 });
SessionSchema.index({ lastActivity: -1 });

const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema);

export default Session;
