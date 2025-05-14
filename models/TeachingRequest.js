import mongoose from 'mongoose';

const TeachingRequestSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  preferredDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create an index for efficient queries
TeachingRequestSchema.index({ fromUser: 1, toUser: 1, skill: 1 });
TeachingRequestSchema.index({ toUser: 1, status: 1 });
TeachingRequestSchema.index({ fromUser: 1, status: 1 });

export default mongoose.models.TeachingRequest || mongoose.model('TeachingRequest', TeachingRequestSchema); 