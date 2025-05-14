import mongoose from 'mongoose';

const TeachingRequestSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skill: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending',
    },
    message: {
      type: String,
      default: '',
    },
    preferredDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Create a compound index to ensure a user can only have one pending request 
// for a particular skill from the same user
TeachingRequestSchema.index(
  { fromUser: 1, toUser: 1, skill: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

export default mongoose.models.TeachingRequest || 
  mongoose.model('TeachingRequest', TeachingRequestSchema); 