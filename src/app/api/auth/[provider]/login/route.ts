import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { encrypt } from '@/lib/encryption';
import { redirect } from 'next/navigation';

// Configuration for each provider
const OAUTH_CONFIG: Record<string, {
    clientId: string;
    clientSecret: string;
    authUrl: string;
    tokenUrl: string;
    scope: string;
}> = {
    twitter: {
        clientId: process.env.TWITTER_CLIENT_ID || '',
        clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
        authUrl: 'https://twitter.com/i/oauth2/authorize',
        tokenUrl: 'https://api.twitter.com/2/oauth2/token',
        scope: 'tweet.read tweet.write users.read offline.access',
    },
    linkedin: {
        clientId: process.env.LINKEDIN_CLIENT_ID || '',
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
        scope: 'w_member_social r_liteprofile',
    },
    // Add others similarly (Facebook, Instagram, etc. often use their own SDKs but REST works too)
    facebook: {
        clientId: process.env.FACEBOOK_APP_ID || '',
        clientSecret: process.env.FACEBOOK_APP_SECRET || '',
        authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
        scope: 'pages_manage_posts,pages_read_engagement',
    },
    // ...
};

export async function GET(
    req: NextRequest,
    { params }: { params: { provider: string } }
) {
    const provider = params.provider.toLowerCase();
    const config = OAUTH_CONFIG[provider];

    if (!config) {
        return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
    }

    // 1. Build Redirect URL
    const redirectUri = `${req.nextUrl.origin}/api/auth/${provider}/callback`;
    const state = Math.random().toString(36).substring(7); // In prod, sign this state/store in cookie to prevent CSRF

    const paramsUrl = new URLSearchParams({
        response_type: 'code',
        client_id: config.clientId,
        redirect_uri: redirectUri,
        scope: config.scope,
        state: state,
        // Twitter specific
        ...(provider === 'twitter' ? { code_challenge: 'challenge', code_challenge_method: 'plain' } : {}),
    });

    return NextResponse.redirect(`${config.authUrl}?${paramsUrl.toString()}`);
}
