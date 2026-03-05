import mongoose from 'mongoose';

const postAttemptSchema = new mongoose.Schema(
    {
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
        platform: {
            type: String,
            required: true,
            enum: ['TWITTER', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'YOUTUBE', 'TIKTOK', 'PINTEREST', 'MASTODON', 'THREADS'],
        },
        status: {
            type: String,
            enum: ['PENDING', 'SUCCESS', 'FAILED', 'SKIPPED'],
            default: 'PENDING',
        },
        platformPostId: {
            type: String,
            default: null,
        },
        error: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

// Unique per post + platform
postAttemptSchema.index({ postId: 1, platform: 1 }, { unique: true });

export default mongoose.model('PostAttempt', postAttemptSchema);
