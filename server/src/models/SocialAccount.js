import mongoose from 'mongoose';

const socialAccountSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        provider: {
            type: String,
            required: true,
            lowercase: true,
            enum: ['twitter', 'facebook', 'instagram', 'linkedin', 'youtube', 'tiktok', 'pinterest', 'mastodon', 'threads'],
        },
        accessToken: {
            type: String,
            required: true, // Stored encrypted
        },
        refreshToken: {
            type: String,
            default: null,
        },
        expiresAt: {
            type: Date,
            default: null,
        },
        platformId: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

// Unique per user + provider
socialAccountSchema.index({ userId: 1, provider: 1 }, { unique: true });

export default mongoose.model('SocialAccount', socialAccountSchema);
