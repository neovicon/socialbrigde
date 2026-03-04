import { cookies } from 'next/headers';
import { decrypt } from '@/lib/encryption';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function getSessionUser() {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return null;

    try {
        const userId = decrypt(session);
        if (!userId) return null;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                apiKeys: true,
                accounts: true,
                posts: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    include: { attempts: true }
                }
            }
        });

        return user;
    } catch (error) {
        return null;
    }
}

export async function requireUser() {
    const user = await getSessionUser();
    if (!user) {
        redirect('/');
    }
    return user;
}
