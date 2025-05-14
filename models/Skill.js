import mongoose from 'mongoose';

const SkillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    count: {
        type: Number,
        default: 1,
    },
}, {
    timestamps: true,
});

export default mongoose.models.Skill || mongoose.model('Skill', SkillSchema);
