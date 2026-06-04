import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function AuthGate() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        const savedToken = localStorage.getItem('gd_token');
        const token = tokenFromUrl || savedToken;

        if (token) {
            // Let the AuthContext know about the token, but we fetch manually to get the user
            // Set the token temporarily in localStorage so axios interceptor picks it up
            localStorage.setItem('gd_token', token);
            
            API.get('/auth/me')
                .then(res => {
                    const user = res.data.user;
                    login(token, user);
                    if (user.role === 'admin') {
                        navigate('/admin/dashboard', { replace: true });
                    } else {
                        navigate('/dashboard', { replace: true });
                    }
                })
                .catch((error) => {
                    console.error("AuthGate error:", error);
                    setError("Failed to authenticate with the server. Please check your connection or login again.");
                });
        } else {
            setError("No authentication token found in the URL.");
        }
    }, [navigate]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white shadow rounded border border-gray-200">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Authentication Failed</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.href = 'http://localhost:5174/login'}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        Return to Central Hub
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-4 text-lg font-semibold text-gray-700">Authenticating with SmartPrep Hub...</p>
        </div>
    );
}
