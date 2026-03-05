/**
 * Smart Router — determines optimal social platforms based on media type and metadata.
 * Direct port of the original TypeScript smart-router.ts logic.
 */
export function smartRoute(mediaType, metadata = {}) {
    const platforms = new Set();
    const { duration, width, height } = metadata;

    // ── Base rules by media type ──────────────────────────────
    if (mediaType === 'TEXT') {
        platforms.add('TWITTER');
        platforms.add('THREADS');
        platforms.add('LINKEDIN');
        platforms.add('FACEBOOK');
        platforms.add('MASTODON');
    }

    if (mediaType === 'IMAGE') {
        platforms.add('INSTAGRAM');
        platforms.add('FACEBOOK');
        platforms.add('PINTEREST');
        platforms.add('TWITTER');
        platforms.add('LINKEDIN');
    }

    if (mediaType === 'VIDEO') {
        const dur = duration || 0;

        if (dur <= 60) {
            // Short-form
            platforms.add('TIKTOK');
            platforms.add('INSTAGRAM'); // Reels
            platforms.add('YOUTUBE');   // Shorts
            platforms.add('FACEBOOK');  // Reels
            platforms.add('TWITTER');
        } else {
            // Long-form
            platforms.add('YOUTUBE');
            platforms.add('FACEBOOK');
            platforms.add('LINKEDIN');
            platforms.add('TWITTER');
        }
    }

    // ── Geometry rules (image or video) ──────────────────────
    if (width && height) {
        const ratio = width / height;

        const isVertical = ratio < 0.8;               // ~9:16
        const isSquare = ratio >= 0.8 && ratio <= 1.2; // ~1:1
        const isLandscape = ratio > 1.2;               // ~16:9

        if (isVertical) {
            platforms.add('TIKTOK');
            platforms.add('INSTAGRAM');
            platforms.add('YOUTUBE');
            platforms.add('PINTEREST');
        }

        if (isSquare) {
            platforms.add('INSTAGRAM');
            platforms.add('FACEBOOK');
            platforms.add('LINKEDIN');
        }

        if (isLandscape) {
            platforms.add('YOUTUBE');
            platforms.add('FACEBOOK');
            platforms.add('LINKEDIN');
        }
    }

    return Array.from(platforms);
}
