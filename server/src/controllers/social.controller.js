import axios from 'axios';
import crypto from 'crypto';
import SocialAccount from '../models/SocialAccount.js';
import { encrypt } from '../utils/encryption.js';
import { asyncHandler } from '../middleware/error.js';
import jwt from 'jsonwebtoken';

// ─── Helpers ────────────────────────────────────────────────────────────────

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

/** Extract userId from JWT embedded in OAuth `state` param */
function userIdFromState(state) {
    try {
        const payload = jwt.verify(state, process.env.JWT_SECRET);
        return payload.id;
    } catch {
        return null;
    }
}

// ─── Facebook OAuth 2.0 ─────────────────────────────────────────────────────

const FB_AUTH_URL = 'https://www.facebook.com/v19.0/dialog/oauth';
const FB_TOKEN_URL = 'https://graph.facebook.com/v19.0/oauth/access_token';
const FB_ME_URL = 'https://graph.facebook.com/v19.0/me';
const FB_CALLBACK = `${SERVER_URL}/api/auth/facebook/callback`;
const FB_SCOPES = ['email', 'public_profile', 'pages_manage_posts', 'pages_read_engagement'].join(',');

/**
 * GET /api/auth/facebook/connect
 * Requires: ?token=<jwt>  (the dashboard appends the user's JWT)
 */
export const facebookConnect = asyncHandler(async (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.redirect(`${CLIENT_URL}/dashboard?error=missing_token`);
    }

    const params = new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID,
        redirect_uri: FB_CALLBACK,
        scope: FB_SCOPES,
        state: token,           // JWT travels as state - verified in callback
        response_type: 'code',
    });

    res.redirect(`${FB_AUTH_URL}?${params}`);
});

/**
 * GET /api/auth/facebook/callback
 * Facebook redirects here after user authorises
 */
export const facebookCallback = asyncHandler(async (req, res) => {
    const { code, state, error } = req.query;

    if (error || !code) {
        console.error('[Facebook OAuth] Error:', error);
        return res.redirect(`${CLIENT_URL}/dashboard?error=facebook_denied`);
    }

    const userId = userIdFromState(state);
    if (!userId) {
        return res.redirect(`${CLIENT_URL}/dashboard?error=invalid_state`);
    }

    // Exchange code for access token
    const tokenRes = await axios.get(FB_TOKEN_URL, {
        params: {
            client_id: process.env.FACEBOOK_APP_ID,
            client_secret: process.env.FACEBOOK_APP_SECRET,
            redirect_uri: FB_CALLBACK,
            code,
        },
    });

    const { access_token, expires_in } = tokenRes.data;

    // Fetch Facebook user ID
    const meRes = await axios.get(FB_ME_URL, {
        params: { fields: 'id,name', access_token },
    });
    const platformId = meRes.data.id;

    const expiresAt = expires_in
        ? new Date(Date.now() + expires_in * 1000)
        : null;

    // Upsert SocialAccount (encrypt token at rest)
    await SocialAccount.findOneAndUpdate(
        { userId, provider: 'facebook' },
        {
            userId,
            provider: 'facebook',
            accessToken: encrypt(access_token),
            expiresAt,
            platformId,
        },
        { upsert: true, new: true }
    );

    console.log(`[Facebook OAuth] Connected for user ${userId} (fb:${platformId})`);
    res.redirect(`${CLIENT_URL}/dashboard?connected=facebook`);
});

// ─── Twitter / X  OAuth 2.0 (PKCE) ─────────────────────────────────────────

const TW_AUTH_URL = 'https://twitter.com/i/oauth2/authorize';
const TW_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';
const TW_ME_URL = 'https://api.twitter.com/2/users/me';
const TW_CALLBACK = `${SERVER_URL}/api/auth/twitter/callback`;
const TW_SCOPES = 'tweet.read tweet.write users.read offline.access';

/** Generate PKCE code verifier + challenge */
function generatePKCE() {
    const verifier = crypto.randomBytes(32).toString('base64url');
    const challenge = crypto
        .createHash('sha256')
        .update(verifier)
        .digest('base64url');
    return { verifier, challenge };
}

// Temporary in-memory store for PKCE verifiers (keyed by state).
// Fine for single-process dev; swap for Redis in production.
const pkceStore = new Map();

/**
 * GET /api/auth/twitter/connect
 * Requires: ?token=<jwt>
 */
export const twitterConnect = asyncHandler(async (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.redirect(`${CLIENT_URL}/dashboard?error=missing_token`);
    }

    const { verifier, challenge } = generatePKCE();

    // Use JWT as state, store verifier so callback can retrieve it
    pkceStore.set(token, { verifier, createdAt: Date.now() });

    // Clean up entries older than 10 minutes
    const TEN_MIN = 10 * 60 * 1000;
    for (const [k, v] of pkceStore) {
        if (Date.now() - v.createdAt > TEN_MIN) pkceStore.delete(k);
    }

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.TWITTER_CLIENT_ID,
        redirect_uri: TW_CALLBACK,
        scope: TW_SCOPES,
        state: token,
        code_challenge: challenge,
        code_challenge_method: 'S256',
    });

    res.redirect(`${TW_AUTH_URL}?${params}`);
});

/**
 * GET /api/auth/twitter/callback
 * Twitter redirects here after user authorises
 */
export const twitterCallback = asyncHandler(async (req, res) => {
    const { code, state, error } = req.query;

    if (error || !code) {
        console.error('[Twitter OAuth] Error:', error);
        return res.redirect(`${CLIENT_URL}/dashboard?error=twitter_denied`);
    }

    const userId = userIdFromState(state);
    if (!userId) {
        return res.redirect(`${CLIENT_URL}/dashboard?error=invalid_state`);
    }

    const pkce = pkceStore.get(state);
    if (!pkce) {
        return res.redirect(`${CLIENT_URL}/dashboard?error=pkce_expired`);
    }
    pkceStore.delete(state);

    // Exchange code + verifier for access token
    const credentials = Buffer.from(
        `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
    ).toString('base64');

    const tokenRes = await axios.post(
        TW_TOKEN_URL,
        new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: TW_CALLBACK,
            code_verifier: pkce.verifier,
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${credentials}`,
            },
        }
    );

    const { access_token, refresh_token, expires_in } = tokenRes.data;

    // Fetch Twitter user ID
    const meRes = await axios.get(TW_ME_URL, {
        headers: { Authorization: `Bearer ${access_token}` },
    });
    const platformId = meRes.data.data?.id;

    const expiresAt = expires_in
        ? new Date(Date.now() + expires_in * 1000)
        : null;

    // Upsert SocialAccount
    await SocialAccount.findOneAndUpdate(
        { userId, provider: 'twitter' },
        {
            userId,
            provider: 'twitter',
            accessToken: encrypt(access_token),
            refreshToken: refresh_token ? encrypt(refresh_token) : null,
            expiresAt,
            platformId,
        },
        { upsert: true, new: true }
    );

    console.log(`[Twitter OAuth] Connected for user ${userId} (tw:${platformId})`);
    res.redirect(`${CLIENT_URL}/dashboard?connected=twitter`);
});
