import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Key, Share2, FileText, ExternalLink, Plus } from 'lucide-react';
import { toast } from 'sonner';

const DashboardPage = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/user/me');
                setData(res.data);
            } catch (err) {
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="container py-24 text-center">Loading Dashboard...</div>;

    return (
        <div className="dashboard container py-12 animate-fade-in">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl">Dashboard</h1>
                    <p className="text-muted">Welcome back, {user?.name || user?.email}</p>
                </div>
                <button className="btn-primary flex items-center gap-1">
                    <Plus size={18} />
                    <span>New Post</span>
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="glass-card">
                    <div className="flex items-center gap-1 mb-2">
                        <Key className="text-primary" size={24} />
                        <h3>Your API Key</h3>
                    </div>
                    <p className="text-muted text-sm mb-2">Use this key to authenticate your requests from your backend.</p>
                    <div className="p-4 bg-bg-dark border border-glass rounded font-mono text-sm break-all">
                        {data?.apiKeys[0]?.key || 'No key generated'}
                    </div>
                </div>

                <div className="glass-card">
                    <div className="flex items-center gap-1 mb-2">
                        <Share2 className="text-primary" size={24} />
                        <h3>Connected Accounts</h3>
                    </div>
                    <p className="text-muted text-sm mb-2">Manage your social media connections.</p>
                    <div className="flex flex-column gap-1">
                        {data?.accounts.length > 0 ? (
                            data.accounts.map(acc => (
                                <div key={acc.id} className="flex justify-between items-center p-3 bg-bg-dark border border-glass rounded">
                                    <span className="capitalize">{acc.provider}</span>
                                    <span className="badge badge-green">Connected</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted py-4 text-center italic">No accounts connected yet.</p>
                        )}
                        <div className="flex gap-1 mt-1">
                            <button className="btn-outline flex-1 py-2 text-sm">Add Twitter</button>
                            <button className="btn-outline flex-1 py-2 text-sm">Add Facebook</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card">
                <div className="flex items-center gap-1 mb-4">
                    <FileText className="text-primary" size={24} />
                    <h3>Recent Posts</h3>
                </div>
                {data?.posts.length > 0 ? (
                    <div className="overflow-x">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-glass">
                                    <th className="py-4 px-2 text-muted uppercase text-xs">ID</th>
                                    <th className="py-4 px-2 text-muted uppercase text-xs">Type</th>
                                    <th className="py-4 px-2 text-muted uppercase text-xs">Caption</th>
                                    <th className="py-4 px-2 text-muted uppercase text-xs">Status</th>
                                    <th className="py-4 px-2 text-muted uppercase text-xs">Date</th>
                                    <th className="py-4 px-2 text-muted uppercase text-xs"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.posts.map(post => (
                                    <tr key={post.id} className="border-b border-glass hover:bg-glass">
                                        <td className="py-4 px-2 font-mono text-xs text-muted">{post.id.substring(0, 8)}...</td>
                                        <td className="py-4 px-2"><span className="badge badge-blue">{post.mediaType}</span></td>
                                        <td className="py-4 px-2 truncate max-w-sm">{post.caption || 'No caption'}</td>
                                        <td className="py-4 px-2">
                                            <span className={`badge ${post.status === 'COMPLETED' ? 'badge-green' : 'badge-blue'}`}>
                                                {post.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-2 text-muted text-sm">{new Date(post.createdAt).toLocaleDateString()}</td>
                                        <td className="py-4 px-2 text-right">
                                            <button className="p-2 hover:text-primary transition-colors"><ExternalLink size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted">
                        <p>You haven't submitted any posts yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
