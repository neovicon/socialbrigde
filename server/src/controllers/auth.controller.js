import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';
import ApiKey from '../models/ApiKey.js';
import { asyncHandler } from '../middleware/error.js';

const generateToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/signup
export const signup = asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Email and password are required');
    }
    if (password.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters');
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
        res.status(409);
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || email.split('@')[0],
    });

    // Auto-generate an API key
    const apiKey = await ApiKey.create({
        key: `sk_live_${uuidv4().replace(/-/g, '')}`,
        userId: user._id,
    });

    const token = generateToken(user._id);

    res.status(201).json({
        token,
        user: {
            id: user._id,
            email: user.email,
            name: user.name,
        },
    });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Email and password are required');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    const token = generateToken(user._id);

    res.json({
        token,
        user: {
            id: user._id,
            email: user.email,
            name: user.name,
        },
    });
});

// POST /api/auth/logout  (stateless — client discards token)
export const logout = asyncHandler(async (_req, res) => {
    res.json({ message: 'Logged out successfully' });
});
