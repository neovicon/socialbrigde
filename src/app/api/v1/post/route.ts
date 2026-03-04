import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { analyzeMedia } from '@/lib/media';
import { smartRoute } from '@/lib/smart-router';
import { socialQueue } from '@/lib/queue';
import { MediaType, Platform } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// Helper to download media to temp (mock or real)
// For real implementation, we stream download to temp for ffmpeg analysis
async function downloadMedia(url: string): Promise<string> {
    const tmpDir = os.tmpdir();
    const ext = path.extname(url).split('?')[0] || '.tmp';
    const filePath = path.join(tmpDir, `${uuidv4()}${ext}`);

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filePath));
        writer.on('error', reject);
    });
}

export async function POST(req: NextRequest) {
    try {
        // 1. Auth
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing API Key' }, { status: 401 });
        }
        const token = authHeader.replace('Bearer ', '');
        const user = await validateApiKey(token);

        if (!user) {
            return NextResponse.json({ error: 'Invalid API Key' }, { status: 401 });
        }

        // 2. Parse Body
        const body = await req.json();
        const { caption, media_url, smart_route = true } = body;

        if (!media_url) {
            return NextResponse.json({ error: 'media_url is required' }, { status: 400 });
        }

        // 3. Analyze Media
        // We need to download it to analyze duration/dimensions
        // In production, this might be done by a worker, but for "Core Logic" demonstration we do it inline here 
        // or offload to worker directly. 
        // Requirements say "Detect media type... Detect video duration...".
        // We'll simplisticly detect type from extension or contentType, but analysis is safer.

        let mediaType: MediaType = 'TEXT';
        // Naive extension check
        const lowerUrl = media_url.toLowerCase();
        if (lowerUrl.match(/\.(jpg|jpeg|png|webp|gif)/)) mediaType = 'IMAGE';
        else if (lowerUrl.match(/\.(mp4|mov|avi|mkv)/)) mediaType = 'VIDEO';

        let metadata = {};
        let platforms: Platform[] = [];

        // If implementing robustly:
        // const filePath = await downloadMedia(media_url);
        // const analysis = await analyzeMedia(filePath);
        // metadata = { duration: analysis.duration, width: analysis.width, height: analysis.height };
        // // cleanup filePath

        // For this plan, we'll assume we can pass metadata or defaults
        // Let's assume we proceed to worker for analysis if strict?
        // But prompt says "System must: 1) Detect..." before routing?
        // We'll assume we do it here. 
        // WARNING: Downloading large video in serverless function (Vercel) might timeout.
        // We'll rely on the worker to do the heavy lifting? 
        // If successful routing is executing immediately in response, we need analysis now.
        // If routing is part of "job", we just enqueue.
        // "Smart Routing Rules" -> need to know platforms to create PostAttempts.

        // Let's stub analysis for non-local files or implement strict check if feasible.
        // We'll default to enqueuing analysis job? 
        // But then we can't create PostAttempts for specific platforms yet.
        // Strategy: Create Post -> Enqueue "AnalyzeAndRoute" job.
        // But user wants "Unified API" response? 
        // We'll implement the FULL flow in the worker mostly, OR basic checks here.

        // For the purpose of this task (Code Logic), let's assume valid input and basic routing.
        // If strict routing needed:
        // We'll do it in worker to avoid timeouts.
        // Response: "Post created, processing..."

        // However, Prompt says "Smart routing rules...".
        // We'll create the Post in PENDING state.

        const post = await prisma.post.create({
            data: {
                userId: user.id,
                caption,
                mediaUrl: media_url,
                mediaType,
                smartRoute: !!smart_route,
                status: 'PENDING',
            },
        });

        // Enqueue job
        await socialQueue.add('POST_CONTENT', {
            postId: post.id,
            userId: user.id,
            mediaUrl: media_url,
            caption,
            smartRoute: !!smart_route,
        });

        return NextResponse.json({
            success: true,
            data: {
                postId: post.id,
                status: 'PENDING',
                message: 'Content queued for smart routing and distribution',
            },
        });

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
