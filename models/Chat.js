import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
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

const ChatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    messages: [MessageSchema],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Make sure that chats between the same participants are unique
ChatSchema.index({ participants: 1 }, { unique: true });

// Helper method to check if user is a participant
ChatSchema.methods.isParticipant = function (userId) {
    return this.participants.some(participantId =>
        participantId.toString() === userId.toString()
    );
};

// Update lastUpdated when new messages are added
ChatSchema.pre('save', function (next) {
    if (this.isModified('messages')) {
        this.lastUpdated = new Date();
    }
    next();
});

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema); 