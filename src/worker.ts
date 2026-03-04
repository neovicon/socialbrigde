import { Worker, Job } from 'bullmq';
import { prisma } from '@/lib/prisma';
import { smartRoute } from '@/lib/smart-router';
import { decrypt } from '@/lib/encryption';
import { QUEUE_NAME } from '@/lib/queue';
import { Platform } from '@prisma/client';

console.log('Starting SocialBridge Worker...');

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
};

const worker = new Worker(QUEUE_NAME, async (job: Job) => {
    console.log(`[Job ${job.id}] Processing ${job.name}...`);

    if (job.name === 'POST_CONTENT') {
        const { postId, mediaUrl, caption, smartRoute: useSmartRoute } = job.data;

        try {
            // 1. Fetch Post and User Accounts
            const post = await prisma.post.findUnique({
                where: { id: postId },
                include: { user: { include: { accounts: true } } },
            });

            if (!post) {
                console.error(`Post ${postId} not found`);
                return;
            }

            await prisma.post.update({
                where: { id: postId },
                data: { status: 'PROCESSING' }
            });

            // 2. Determine target platforms
            let targetPlatforms: Platform[] = [];
            if (useSmartRoute) {
                // In a real scenario, we would download and analyze media here.
                // For now, we assume metadata is passed or we default based on "VIDEO"/"IMAGE" checks in queue logic
                // Re-run smartRoute with dummy metadata or basic type check
                targetPlatforms = smartRoute(post.mediaType, { duration: 30, width: 1080, height: 1080 }); // Mock metadata
            } else {
                // If not smart route, maybe all connected? Or specified? prompt implies "Enable Smart Routing".
                // If disabled, maybe default to all? 
                // We'll assume Smart Route is the main way.
                targetPlatforms = smartRoute(post.mediaType);
            }

            console.log(`[Job ${job.id}] Targets: ${targetPlatforms.join(', ')}`);

            // 3. Create Attempts
            const accounts = post.user.accounts;

            for (const platform of targetPlatforms) {
                // Check if user has this platform connected
                const account = accounts.find(acc => acc.provider.toUpperCase() === platform);

                if (!account) {
                    console.log(`[Job ${job.id}] Skipping ${platform} - No account connected`);
                    continue;
                }

                // Create attempt record
                const attempt = await prisma.postAttempt.create({
                    data: {
                        postId: post.id,
                        platform: platform,
                        status: 'PENDING'
                    }
                });

                // 4. Execute Post (Mock/Stub for now as we don't have real creds)
                try {
                    // Verify/Refresh Token
                    const accessToken = decrypt(account.accessToken);
                    // const refreshToken = account.refreshToken ? decrypt(account.refreshToken) : null;

                    // Simulate API call delay
                    await new Promise(r => setTimeout(r, 1000));

                    // Success
                    await prisma.postAttempt.update({
                        where: { id: attempt.id },
                        data: {
                            status: 'SUCCESS',
                            platformPostId: `mock_${platform}_${Date.now()}`
                        }
                    });

                    console.log(`[Job ${job.id}] Posted to ${platform}`);

                } catch (e: any) {
                    console.error(`[Job ${job.id}] Failed to post to ${platform}:`, e);
                    await prisma.postAttempt.update({
                        where: { id: attempt.id },
                        data: {
                            status: 'FAILED',
                            error: e.message
                        }
                    });
                }
            }

            // 5. Update overall status
            // Check if any failed
            const attempts = await prisma.postAttempt.findMany({ where: { postId: post.id } });
            const anyFailed = attempts.some(a => a.status === 'FAILED');
            const allSuccess = attempts.every(a => a.status === 'SUCCESS');

            await prisma.post.update({
                where: { id: post.id },
                data: {
                    status: allSuccess ? 'COMPLETED' : (anyFailed ? 'PARTIAL' : 'COMPLETED') // Simplified
                }
            });

            console.log(`[Job ${job.id}] Finished.`);

        } catch (err) {
            console.error(`[Job ${job.id}] Error:`, err);
            // Mark as failed
        }
    }

}, { connection });

worker.on('completed', job => {
    console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    console.log(`${job?.id} has failed with ${err.message}`);
});
