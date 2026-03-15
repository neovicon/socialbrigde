import { Router } from 'express';
import {
    facebookConnect,
    facebookCallback,
    twitterConnect,
    twitterCallback,
} from '../controllers/social.controller.js';

const router = Router();

// ── Facebook OAuth 2.0 ──────────────────────────────────────────────────────
router.get('/facebook/connect', facebookConnect);
router.get('/facebook/callback', facebookCallback);

// ── Twitter OAuth 2.0 (PKCE) ────────────────────────────────────────────────
router.get('/twitter/connect', twitterConnect);
router.get('/twitter/callback', twitterCallback);

export default router;
