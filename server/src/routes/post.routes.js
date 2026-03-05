import { Router } from 'express';
import { createPost, getPosts, analyzeMedia } from '../controllers/post.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/analyze', protect, analyzeMedia);
router.get('/', protect, getPosts);
router.post('/', protect, createPost);

export default router;
