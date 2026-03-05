import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        lastUsed: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

export default mongoose.model('ApiKey', apiKeySchema);
