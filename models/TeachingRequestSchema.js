import mongoose from 'mongoose';

// Schema for teaching appointment requests
const TeachingRequestSchema = new mongoose.Schema({
  skill: {
    type: String,
    required: true,
    trim: true
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    default: '',
    trim: true
  },
  preferredDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default TeachingRequestSchema; 