import User from '../models/User.js';
import ApiKey from '../models/ApiKey.js';
import SocialAccount from '../models/SocialAccount.js';
import Post from '../models/Post.js';
import { asyncHandler } from '../middleware/error.js';

// GET /api/user/me
export const getMe = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const [user, apiKeys, accounts, posts] = await Promise.all([
        User.findById(userId).select('-password'),
        ApiKey.find({ userId }).sort({ createdAt: -1 }),
        SocialAccount.find({ userId }),
        Post.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('attempts'),
    ]);

    // Populate attempts manually since mongoose virtual populate needs setup
    const postsWithAttempts = await Post.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

    res.json({
        user: {
            id: user._id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
        },
        apiKeys,
        accounts,
        posts: postsWithAttempts,
    });
});
