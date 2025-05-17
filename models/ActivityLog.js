import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  actionType: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'profile_edit',
      'post_create',
      'post_edit',
      'post_delete',
      'comment_create',
      'comment_edit',
      'comment_delete',
      'message_send',
      'report_submit',
      'account_ban',
      'account_unban',
      'session_terminate',
      'content_moderate',
      'admin_dashboard_visit',
      'VIEW_REPORTS',
      'VIEW_USERS'
    ]
  },
  targetId: {
    // ID of the target object (post, comment, user, etc.)
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetModel',
  },
  targetModel: {
    // Model name of the target (Post, Comment, User, etc.)
    type: String,
    enum: ['User', 'Post', 'Comment', 'Message', 'Report', null],
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    // Additional details specific to the action
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes for efficient querying
ActivityLogSchema.index({ userId: 1 });
ActivityLogSchema.index({ actionType: 1 });
ActivityLogSchema.index({ timestamp: -1 });

const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);

export default ActivityLog;
