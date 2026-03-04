import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { encrypt } from '@/lib/encryption';
import axios from 'axios';

const OAUTH_CONFIG: Record<string, {
    clientId: string;
    clientSecret: string;
    tokenUrl: string;
}> = {
    twitter: {
        clientId: process.env.TWITTER_CLIENT_ID || '',
        clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
        tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    },
    linkedin: {
        clientId: process.env.LINKEDIN_CLIENT_ID || '',
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    },
    facebook: {
        clientId: process.env.FACEBOOK_APP_ID || '',
        clientSecret: process.env.FACEBOOK_APP_SECRET || '',
        tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
    },
};

export async function GET(
    req: NextRequest,
    { params }: { params: { provider: string } }
) {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.redirect(new URL('/', req.url)); // Must be logged in
    }

    const provider = params.provider.toLowerCase();
    const config = OAUTH_CONFIG[provider];

    if (!config) {
        return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    if (!code) {
        return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    const redirectUri = `${req.nextUrl.origin}/api/auth/${provider}/callback`;

    try {
        // 2. Exchange Code for Token
        // Note: Request body format varies slightly by provider (FormData vs JSON). 
        // We'll assume standard URL-encoded form data for generic OAuth2.

        const tokenParams = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: config.clientId,
            client_secret: config.clientSecret,
            // Twitter specific
            ...(provider === 'twitter' ? { code_verifier: 'challenge' } : {}),
        });

        const tokenRes = await axios.post(config.tokenUrl, tokenParams.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        // Handle different response structures
        const data = tokenRes.data;
        const accessToken = data.access_token;
        const refreshToken = data.refresh_token; // may be undefined
        const expiresIn = data.expires_in; // seconds

        if (!accessToken) {
            throw new Error('No access token returned');
        }

        // 3. Save to DB
        const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;

        // Encrypt tokens
        const encAccess = encrypt(accessToken);
        const encRefresh = refreshToken ? encrypt(refreshToken) : undefined;

        await prisma.socialAccount.upsert({
            where: {
                userId_provider: {
                    userId: user.id,
                    provider: provider.toUpperCase(),
                }
            },
            update: {
                accessToken: encAccess,
                refreshToken: encRefresh,
                expiresAt,
                updatedAt: new Date(),
            },
            create: {
                userId: user.id,
                provider: provider.toUpperCase(), // ENUM must match
                accessToken: encAccess,
                refreshToken: encRefresh,
                expiresAt,
            }
        });

        return NextResponse.redirect(new URL('/dashboard', req.url));

    } catch (error: any) {
        console.error(`OAuth Success Error for ${provider}:`, error.response?.data || error.message);
        return NextResponse.json({
            error: 'OAuth Exchange Failed',
            details: error.response?.data || error.message
        }, { status: 500 });
    }
}
