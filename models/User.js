// models/User.js
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

// Schema for skills the user has mastered and can teach others
const MasteredSkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  experienceYears: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

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
