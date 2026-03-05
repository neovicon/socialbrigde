import React, { useState } from 'react';
import api from '../api';
import { Search, Info, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const AnalyzePage = () => {
    const [mediaType, setMediaType] = useState('VIDEO');
    const [duration, setDuration] = useState(30);
    const [width, setWidth] = useState(1080);
    const [height, setHeight] = useState(1920);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.get('/posts/analyze', {
                params: { mediaType, duration, width, height }
            });
            setResults(res.data.platforms);
            toast.success('Analysis complete');
        } catch (err) {
            toast.error('Analysis failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="analyze-page container py-12 animate-fade-in">
            <header className="mb-8">
                <h1 className="text-4xl">Smart Router Demo</h1>
                <p className="text-muted">Test how our algorithm routes your content to the best platforms.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card md:col-span-1">
                    <div className="flex items-center gap-1 mb-4">
                        <Search className="text-primary" size={24} />
                        <h3>Parameters</h3>
                    </div>
                    <form onSubmit={handleAnalyze}>
                        <div className="input-group">
                            <label>Media Type</label>
                            <select
                                className="w-full bg-bg-dark border border-glass text-main p-3 rounded"
                                value={mediaType}
                                onChange={(e) => setMediaType(e.target.value)}
                            >
                                <option value="VIDEO">Video</option>
                                <option value="IMAGE">Image</option>
                                <option value="TEXT">Text only</option>
                            </select>
                        </div>

                        {mediaType === 'VIDEO' && (
                            <div className="input-group">
                                <label>Duration (seconds)</label>
                                <input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                />
                            </div>
                        )}

                        {(mediaType === 'VIDEO' || mediaType === 'IMAGE') && (
                            <div className="flex gap-2">
                                <div className="input-group flex-1">
                                    <label>Width (px)</label>
                                    <input
                                        type="number"
                                        value={width}
                                        onChange={(e) => setWidth(e.target.value)}
                                    />
                                </div>
                                <div className="input-group flex-1">
                                    <label>Height (px)</label>
                                    <input
                                        type="number"
                                        value={height}
                                        onChange={(e) => setHeight(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <button type="submit" className="btn-primary w-full py-3 mt-4" disabled={loading}>
                            {loading ? 'Analyzing...' : 'Analyze Content'}
                        </button>
                    </form>
                </div>

                <div className="glass-card md:col-span-2">
                    <div className="flex items-center gap-1 mb-4">
                        <Info className="text-primary" size={24} />
                        <h3>Recommended Platforms</h3>
                    </div>

                    {results ? (
                        <div className="results-grid grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {results.map(platform => (
                                <div key={platform} className="p-4 bg-bg-dark border border-glass rounded flex flex-column items-center gap-1 text-center animate-fade-in">
                                    <CheckCircle2 className="text-accent" size={32} />
                                    <span className="font-bold text-sm">{platform}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-muted">
                            <p>Enter parameters and click Analyze to see recommendations.</p>
                        </div>
                    )}

                    <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded">
                        <h4 className="text-primary mb-1 text-sm font-bold uppercase tracking-wider">How it works</h4>
                        <p className="text-sm text-muted">
                            Our algorithm uses aspect ratio (9:16 vertical, 16:9 landscape, 1:1 square) and duration to determine
                            the best placement. Short vertical videos are routed to TikTok, Reels, and Shorts, while longer
                            videos go to YouTube and Facebook.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyzePage;
