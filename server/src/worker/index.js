import 'dotenv/config';
import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Post from '../models/Post.js';
import PostAttempt from '../models/PostAttempt.js';
import SocialAccount from '../models/SocialAccount.js';
import { smartRoute } from '../utils/smartRouter.js';
import { decrypt } from '../utils/encryption.js';
import { QUEUE_NAME } from './queue.js';

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
};

console.log('⚙️  Starting SocialBridge Worker...');

// Connect to MongoDB before processing
await connectDB();

const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
        if (job.name !== 'POST_CONTENT') return;

        const { postId, smartRoute: useSmartRoute } = job.data;
        console.log(`[Job ${job.id}] Processing post ${postId}...`);

        // 1. Fetch the post
        const post = await Post.findById(postId);
        if (!post) {
            console.error(`[Job ${job.id}] Post ${postId} not found — skipping`);
            return;
        }

        // 2. Mark as processing
        await Post.findByIdAndUpdate(postId, { status: 'PROCESSING' });

        // 3. Determine platforms
        const targetPlatforms = smartRoute(post.mediaType, {
            duration: post.metadata?.duration ?? 30,
            width: post.metadata?.width ?? 1080,
            height: post.metadata?.height ?? 1080,
        });

        console.log(`[Job ${job.id}] Target platforms: ${targetPlatforms.join(', ')}`);

        // 4. Get connected accounts
        const accounts = await SocialAccount.find({ userId: post.userId });

        // 5. Process each platform
        const attemptResults = [];
        for (const platform of targetPlatforms) {
            const account = accounts.find(
                (acc) => acc.provider.toUpperCase() === platform
            );

            if (!account) {
                console.log(`[Job ${job.id}] Skipping ${platform} — no account connected`);
                continue;
            }

            // Upsert attempt record
            const attempt = await PostAttempt.findOneAndUpdate(
                { postId, platform },
                { postId, platform, status: 'PENDING' },
                { upsert: true, new: true }
            );

            try {
                const accessToken = decrypt(account.accessToken);

                // Simulate external API call
                await new Promise((r) => setTimeout(r, 1000));

                await PostAttempt.findByIdAndUpdate(attempt._id, {
                    status: 'SUCCESS',
                    platformPostId: `mock_${platform}_${Date.now()}`,
                });

                console.log(`[Job ${job.id}] ✅ Posted to ${platform}`);
                attemptResults.push('SUCCESS');
            } catch (err) {
                console.error(`[Job ${job.id}] ❌ Failed ${platform}:`, err.message);
                await PostAttempt.findByIdAndUpdate(attempt._id, {
                    status: 'FAILED',
                    error: err.message,
                });
                attemptResults.push('FAILED');
            }
        }

        // 6. Update overall post status
        const anyFailed = attemptResults.includes('FAILED');
        const anySuccess = attemptResults.includes('SUCCESS');
        const finalStatus = anyFailed && anySuccess ? 'PARTIAL' : anyFailed ? 'FAILED' : 'COMPLETED';

        await Post.findByIdAndUpdate(postId, { status: finalStatus });
        console.log(`[Job ${job.id}] Done — final status: ${finalStatus}`);
    },
    { connection }
);

worker.on('completed', (job) => console.log(`✅ Job ${job.id} completed`));
worker.on('failed', (job, err) => console.error(`❌ Job ${job?.id} failed: ${err.message}`));
