import mongoose from 'mongoose';

const AnalyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  dailyActiveUsers: {
    type: Number,
    default: 0,
  },
  newUsers: {
    type: Number,
    default: 0,
  },
  totalSessions: {
    type: Number,
    default: 0,
  },
  averageSessionDuration: {
    type: Number, // in seconds
    default: 0,
  },
  totalPosts: {
    type: Number,
    default: 0,
  },
  totalComments: {
    type: Number,
    default: 0,
  },
  totalMessages: {
    type: Number,
    default: 0,
  },
  totalReports: {
    type: Number,
    default: 0,
  },
  contentModerated: {
    type: Number,
    default: 0,
  },
  usersBanned: {
    type: Number,
    default: 0,
  },
  peakActiveTime: {
    type: String, // HH:MM format
  },
  mostActiveUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    activityCount: Number,
  }],
  mostReportedUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reportCount: Number,
  }],
  mostReportedContent: [{
    contentId: mongoose.Schema.Types.ObjectId,
    contentType: String, // 'post', 'comment', 'message'
    reportCount: Number,
  }],
  systemLoad: {
    average: Number,
    peak: Number,
  },
});

// Add indexes for efficient querying
AnalyticsSchema.index({ date: -1 });

const Analytics = mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema);

export default Analytics;
