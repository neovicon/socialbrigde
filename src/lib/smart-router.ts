import { Platform, MediaType } from '@prisma/client';

interface MediaMetadata {
    duration?: number; // in seconds
    width?: number;
    height?: number;
}

export function smartRoute(
    mediaType: MediaType,
    metadata?: MediaMetadata
): Platform[] {
    const platforms = new Set<Platform>();
    const { duration, width, height } = metadata || {};

    // -- BASE RULES BY TYPE --

    if (mediaType === 'TEXT') {
        platforms.add(Platform.TWITTER);
        platforms.add(Platform.THREADS);
        platforms.add(Platform.LINKEDIN);
        platforms.add(Platform.FACEBOOK);
        platforms.add(Platform.MASTODON);
    }

    if (mediaType === 'IMAGE') {
        platforms.add(Platform.INSTAGRAM);
        platforms.add(Platform.FACEBOOK);
        platforms.add(Platform.PINTEREST);
        platforms.add(Platform.TWITTER);
        platforms.add(Platform.LINKEDIN);
    }

    if (mediaType === 'VIDEO') {
        const dur = duration || 0;

        // Video <= 60s
        if (dur <= 60) {
            platforms.add(Platform.TIKTOK);
            platforms.add(Platform.INSTAGRAM); // Reels
            platforms.add(Platform.YOUTUBE);   // Shorts
            platforms.add(Platform.FACEBOOK);  // Reels
            platforms.add(Platform.TWITTER);
        } else {
            // Video > 60s
            platforms.add(Platform.YOUTUBE);
            platforms.add(Platform.FACEBOOK);
            platforms.add(Platform.LINKEDIN);
            platforms.add(Platform.TWITTER);
        }
    }

    // -- GEOMETRY RULES (Video or Image) --

    if (width && height) {
        const ratio = width / height;

        // Vertical (9:16) -> approx 0.5625. range: < 0.8
        const isVertical = ratio < 0.8;

        // Square (1:1) -> approx 1. range: 0.8 - 1.2
        const isSquare = ratio >= 0.8 && ratio <= 1.2;

        // Landscape (16:9) -> approx 1.77. range: > 1.2
        const isLandscape = ratio > 1.2;

        if (isVertical) {
            // "TikTok, Reels, Shorts, Pinterest"
            platforms.add(Platform.TIKTOK);
            platforms.add(Platform.INSTAGRAM); // Reels
            platforms.add(Platform.YOUTUBE);   // Shorts
            platforms.add(Platform.PINTEREST); // For vertical images/video
        }

        if (isSquare) {
            // "Instagram, Facebook, LinkedIn"
            platforms.add(Platform.INSTAGRAM);
            platforms.add(Platform.FACEBOOK);
            platforms.add(Platform.LINKEDIN);
        }

        if (isLandscape) {
            // "YouTube, Facebook, LinkedIn"
            platforms.add(Platform.YOUTUBE);
            platforms.add(Platform.FACEBOOK);
            platforms.add(Platform.LINKEDIN);
        }
    }

    return Array.from(platforms);
}
