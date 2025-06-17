// models/User.js
import mongoose from 'mongoose';
import NotificationSchema from './NotificationSchema';
import MasteredSkillSchema from './MasteredSkillSchema';
import TeachingRequestSchema from './TeachingRequestSchema';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: true,
  },

  resetPasswordToken: {
    type: String,
  },

  resetPasswordExpires: {
    type: Date,
  },

  bio: {
    type: String,
    default: '',
  },

  skills: {
    type: [String],
    default: [],
  },

  // New field for skills the user has mastered and can teach
  masteredSkills: {
    type: [MasteredSkillSchema],
    default: function() {
      return [];
    },
    validate: {
      validator: function(v) {
        return Array.isArray(v);
      },
      message: props => `masteredSkills must be an array`
    }
  },

  // New field for teaching appointment requests
  teachingRequests: {
    type: [TeachingRequestSchema],
    default: [],
  },

  availability: {
    type: String,
    default: '',
  },

  location: {
    type: String,
    default: '',
  },

  isPublic: {
    type: Boolean,
    default: true,
  },

  isAdmin: {
    type: Boolean,
    default: false,
  },

  role: {
    type: String,
    enum: ['user', 'instructor', 'admin'],
    default: 'user',
  },

  isBanned: {
    type: Boolean,
    default: false,
  },

  profileImage: {
    type: String,
    default: '/images/profile-placeholder.png',
  },

  coverImage: {
    type: String,
    default: '/images/cover-placeholder.png',
  },

  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  friendRequests: {
    sent: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    received: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },

  notifications: [NotificationSchema]

}, {
  timestamps: true,
});

// Middleware to ensure masteredSkills is always initialized as an array
UserSchema.pre('save', function(next) {
  if (!this.masteredSkills) {
    this.masteredSkills = [];
  }
  next();
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
