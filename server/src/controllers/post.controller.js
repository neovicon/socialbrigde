import Post from '../models/Post.js';
import { postQueue } from '../worker/queue.js';
import { asyncHandler } from '../middleware/error.js';
import { smartRoute } from '../utils/smartRouter.js';

// POST /api/posts  — create and queue a post
export const createPost = asyncHandler(async (req, res) => {
    const { caption, mediaUrl, mediaType, smartRoute: useSmartRoute = true } = req.body;

    if (!mediaType || !['TEXT', 'IMAGE', 'VIDEO'].includes(mediaType)) {
        res.status(400);
        throw new Error('mediaType must be TEXT, IMAGE, or VIDEO');
    }

    const post = await Post.create({
        userId: req.user._id,
        caption,
        mediaUrl,
        mediaType,
        smartRoute: useSmartRoute,
        status: 'PENDING',
    });

    // Enqueue the BullMQ job
    await postQueue.add('POST_CONTENT', {
        postId: post._id.toString(),
        mediaUrl,
        caption,
        smartRoute: useSmartRoute,
    });

    res.status(201).json({ message: 'Post queued successfully', post });
});

// GET /api/posts  — list current user's posts
export const getPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

    res.json({ posts });
});

// GET /api/posts/analyze  — demo smart router
export const analyzeMedia = asyncHandler(async (req, res) => {
    const { mediaType, duration, width, height } = req.query;

    if (!mediaType) {
        res.status(400);
        throw new Error('mediaType query param is required');
    }

    const platforms = smartRoute(mediaType, {
        duration: duration ? Number(duration) : undefined,
        width: width ? Number(width) : undefined,
        height: height ? Number(height) : undefined,
    });

    res.json({ mediaType, platforms });
});
