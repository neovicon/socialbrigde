import { Queue } from 'bullmq';

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
};

export const QUEUE_NAME = 'socialbridge-posts';

export const postQueue = new Queue(QUEUE_NAME, { connection });

console.log(`📬 BullMQ queue "${QUEUE_NAME}" initialized`);
