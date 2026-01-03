import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from './api/axios';

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('token');
    const email = localStorage.getItem('email') || localStorage.getItem('user_email') || 'User';
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.get('/users/me')
                .then(res => {
                    if (res.data.is_admin) {
                        setIsAdmin(true);
                    }
                })
                .catch(err => console.error("Error fetching user details:", err));
        } else {
            setIsAdmin(false);
        }
    }, [isLoggedIn]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('user_email');
        navigate('/login');
    };

    return (
        <nav className="bg-emerald-600 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        <Link to={isLoggedIn ? "/" : "/"} className="text-white font-bold text-xl">PyCode Arena</Link>
                        <div className="flex items-baseline space-x-4">
                            {isLoggedIn && (
                                <Link to="/" className="text-emerald-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
                            )}
                            {isLoggedIn && (
                                <Link to="/profile" className="text-emerald-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Profile</Link>
                            )}
                            {isLoggedIn && (
                                <Link to="/leaderboard" className="text-emerald-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Leaderboard</Link>
                            )}
                            {isLoggedIn && isAdmin && (
                                <Link to="/add-problem" className="text-emerald-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">New Problem</Link>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center">
                        {isLoggedIn ? (
                            <>
                                <span className="text-emerald-100 text-sm mr-4">Hello, {email}</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-white text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="text-emerald-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Login</Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
