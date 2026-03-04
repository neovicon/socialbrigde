'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { encrypt } from '@/lib/encryption';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const AuthSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(), // For signup
});

export async function signupAction(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    const validation = AuthSchema.safeParse({ email, password, name });

    if (!validation.success) {
        return { error: 'Invalid input. Password must be 6+ chars.' };
    }

    // Check existing
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return { error: 'User already exists.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name: name || email.split('@')[0],
            // Generate an API key automatically
            apiKeys: {
                create: {
                    key: `sk_live_${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}`,
                }
            }
        },
    });

    // Set session
    const sessionData = encrypt(user.id);
    const cookieStore = await cookies();
    cookieStore.set('session', sessionData, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7 });

    redirect('/dashboard');
}

export async function loginAction(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) return { error: 'Missing fields' };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return { error: 'Invalid credentials' };
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return { error: 'Invalid credentials' };
    }

    const sessionData = encrypt(user.id);
    const cookieStore = await cookies();
    cookieStore.set('session', sessionData, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7 });

    redirect('/dashboard');
}

export async function logoutAction() {
    (await cookies()).delete('session');
    redirect('/');
}

export async function analyzeMediaAction(formData: FormData) {
    const url = formData.get('url') as string;
    const type = formData.get('type') as string;

    // Import dynamically to avoid circular issues or just standard import
    const { smartRoute } = await import('@/lib/smart-router');
    const { MediaType } = await import('@prisma/client');
    type MediaTypeType = keyof typeof MediaType;

    // Mock metadata or fetch?
    // We will just run smartRoute based on type for demo
    const platforms = smartRoute(type as any, { duration: 30, width: 1080, height: 1080 }); // Mock metadata for demo

    return { platforms, type };
}
