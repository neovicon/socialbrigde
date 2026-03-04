import { requireUser } from '@/lib/session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { logoutAction } from '../actions';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default async function Dashboard() {
    const user = await requireUser();
    const apiKey = user.apiKeys[0]?.key || 'No API Key';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>
                    <p className="text-slate-500">Welcome back, {user.name || user.email}</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/analyze">
                        <Button variant="secondary">Demo Analyzer</Button>
                    </Link>
                    <form action={logoutAction}>
                        <Button variant="outline">Logout</Button>
                    </form>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* API Key Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Your API Key</CardTitle>
                        <CardDescription>Use this key to authenticate your requests.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded font-mono text-sm break-all">
                            {apiKey}
                        </div>
                        <p className="mt-4 text-xs text-slate-400">
                            Keep this key secret. It allows posting to your connected accounts.
                        </p>
                    </CardContent>
                </Card>

                {/* Connected Accounts */}
                <Card>
                    <CardHeader>
                        <CardTitle>Connected Accounts</CardTitle>
                        <CardDescription>Manage your social media connections.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {user.accounts.length === 0 ? (
                            <p className="text-sm text-slate-500">No accounts connected yet.</p>
                        ) : (
                            <ul className="space-y-2">
                                {user.accounts.map(acc => (
                                    <li key={acc.id} className="flex items-center justify-between p-2 border rounded">
                                        <span className="font-medium capitalize">{acc.provider.toLowerCase()}</span>
                                        <Badge variant="secondary">Connected</Badge>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="flex gap-2 flex-wrap">
                            <Link href="/api/auth/twitter/login">
                                <Button size="sm" variant="outline">Connect Twitter</Button>
                            </Link>
                            <Link href="/api/auth/linkedin/login">
                                <Button size="sm" variant="outline">Connect LinkedIn</Button>
                            </Link>
                            <Link href="/api/auth/facebook/login">
                                <Button size="sm" variant="outline">Connect Facebook</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Posts */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Posts</CardTitle>
                        <CardDescription>Status of your recent submissions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {user.posts.length === 0 ? (
                            <p className="text-sm text-slate-500">No posts found.</p>
                        ) : (
                            <div className="rounded-md border">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-100 dark:bg-slate-800">
                                        <tr>
                                            <th className="p-3">ID</th>
                                            <th className="p-3">Caption</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {user.posts.map(post => (
                                            <tr key={post.id} className="border-t">
                                                <td className="p-3 font-mono text-xs">{post.id.substring(0, 8)}...</td>
                                                <td className="p-3 truncate max-w-[200px]">{post.caption || 'No caption'}</td>
                                                <td className="p-3">
                                                    <Badge variant={post.status === 'COMPLETED' ? 'default' : post.status === 'FAILED' ? 'destructive' : 'secondary'}>
                                                        {post.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 text-slate-500">{post.createdAt.toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
