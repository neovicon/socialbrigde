import { prisma } from '@/lib/prisma';

export async function validateApiKey(key: string) {
    if (!key.startsWith('sk_live_')) return null;

    const apiKey = await prisma.apiKey.findUnique({
        where: { key },
        include: { user: true },
    });

    if (apiKey) {
        // Update last used asynchronously
        await prisma.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsed: new Date() },
        });
        return apiKey.user;
    }
    return null;
}
