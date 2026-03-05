import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Search, Zap } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="glass-navbar sticky top-0 z-50">
            <div className="container py-4 flex justify-between items-center">
                <Link to="/" className="brand flex items-center gap-1 no-underline">
                    <Zap className="text-primary fill-primary" size={24} />
                    <span className="font-bold text-xl gradient-text">SocialBridge</span>
                </Link>

                <div className="flex items-center gap-2">
                    {user ? (
                        <>
                            <Link to="/dashboard" className="btn-outline flex items-center gap-1 py-2 px-4 no-underline">
                                <LayoutDashboard size={18} />
                                <span>Dashboard</span>
                            </Link>
                            <Link to="/analyze" className="btn-outline flex items-center gap-1 py-2 px-4 no-underline">
                                <Search size={18} />
                                <span>Analyze</span>
                            </Link>
                            <button onClick={handleLogout} className="btn-outline text-error border-error-muted flex items-center gap-1 py-2 px-4">
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <Link to="/#auth" className="btn-primary no-underline">Get Started</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
