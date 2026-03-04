import { Queue } from 'bullmq';

// Connection string for Redis. Ensure REDIS_URL is in .env
// Defaults to localhost:6379 if not set (development)
const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
};

export const socialQueue = new Queue('social-posting-queue', {
    connection,
});

export const QUEUE_NAME = 'social-posting-queue';
