import React, { useState } from 'react';
import { LoginForm, SignupForm } from '../components/AuthForms';
import { Zap, Shield, Globe, Cpu, X, Play } from 'lucide-react';

const DemoModal = ({ onClose }) => (
    <div
        className="demo-modal-backdrop"
        onClick={onClose}
        style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(6px)',
            animation: 'fadeIn 0.25s ease-out'
        }}
    >
        <div
            onClick={e => e.stopPropagation()}
            style={{
                background: 'var(--bg-card)',
                borderRadius: '20px',
                border: '1px solid var(--glass-border)',
                width: '90%', maxWidth: '720px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                animation: 'fadeIn 0.3s cubic-bezier(0.4,0,0.2,1)'
            }}
        >
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Play size={18} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontWeight: 600 }}>SocialBridge — Platform Demo</span>
                </div>
                <button
                    onClick={onClose}
                    style={{ background: 'transparent', padding: '0.25rem', borderRadius: '8px', color: 'var(--text-muted)', display: 'flex' }}
                >
                    <X size={20} />
                </button>
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000' }}>
                <iframe
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                    title="SocialBridge Demo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                />
            </div>
            <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={onClose} className="btn-outline" style={{ padding: '0.5rem 1.5rem' }}>Close</button>
            </div>
        </div>
    </div>
);

const LandingPage = () => {
    const [tab, setTab] = useState('login');
    const [showDemo, setShowDemo] = useState(false);

    return (
        <div className="landing-page">
            <section className="hero container py-24 text-center animate-fade-in">
                <div className="badge badge-blue mb-1">New: Smart Video Routing</div>
                <h1 className="text-6xl mb-2">Publish Once, <br /><span className="gradient-text">Everywhere.</span></h1>
                <p className="text-muted text-xl max-w-2xl mx-auto mb-4">
                    SocialBridge analyzes your content and automatically distributes it to the platforms where it performs best.
                </p>
                <div className="flex justify-center gap-2">
                    <a href="#auth" className="btn-primary no-underline py-3 px-8">Start Free Trial</a>
                    <button className="btn-outline py-3 px-8" onClick={() => setShowDemo(true)}>Watch Demo</button>
                </div>
            </section>
            {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}

            <section className="features bg-bg-card py-20 pb-24">
                <div className="container grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-card">
                        <Cpu className="text-primary mb-1" size={32} />
                        <h3 className="mb-1">Smart Analysis</h3>
                        <p className="text-muted">We detect aspect ratio, duration, and content type to pick the perfect platforms.</p>
                    </div>
                    <div className="glass-card">
                        <Globe className="text-primary mb-1" size={32} />
                        <h3 className="mb-1">Universal API</h3>
                        <p className="text-muted">One simple endpoint replaces every social media integration you'll ever need.</p>
                    </div>
                    <div className="glass-card">
                        <Shield className="text-primary mb-1" size={32} />
                        <h3 className="mb-1">Reliable Queue</h3>
                        <p className="text-muted">Built on enterprise-grade infrastructure to handle millions of posts at scale.</p>
                    </div>
                </div>
            </section>

            <section id="auth" className="auth-section container py-32 flex flex-column items-center">
                <div className="glass-card w-full max-w-md">
                    <div className="text-center mb-4">
                        <h2 className="mb-1">Welcome to SocialBridge</h2>
                        <p className="text-muted">Create an account to get your API keys.</p>
                    </div>

                    <div className="tabs flex gap-2 mb-4 bg-bg-dark p-1 border-radius-sm">
                        <button
                            className={`flex-1 py-2 ${tab === 'login' ? 'btn-primary' : 'btn-outline border-none'}`}
                            onClick={() => setTab('login')}
                        >
                            Login
                        </button>
                        <button
                            className={`flex-1 py-2 ${tab === 'signup' ? 'btn-primary' : 'btn-outline border-none'}`}
                            onClick={() => setTab('signup')}
                        >
                            Sign Up
                        </button>
                    </div>

                    {tab === 'login' ? <LoginForm /> : <SignupForm />}
                </div>
            </section>

            <footer className="py-12 border-t border-glass text-center text-muted">
                <p>© 2026 SocialBridge Inc. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
