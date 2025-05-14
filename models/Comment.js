import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
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

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
