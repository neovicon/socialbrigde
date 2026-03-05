import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        caption: {
            type: String,
            default: null,
        },
        mediaUrl: {
            type: String,
            default: null,
        },
        mediaType: {
            type: String,
            required: true,
            enum: ['TEXT', 'IMAGE', 'VIDEO'],
        },
        smartRoute: {
            type: Boolean,
            default: true,
        },
        status: {
            type: String,
            enum: ['PENDING', 'PROCESSING', 'PARTIAL', 'COMPLETED', 'FAILED'],
            default: 'PENDING',
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
    },
    { timestamps: true }
);

export default mongoose.model('Post', postSchema);
