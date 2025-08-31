import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../hooks/useUI';

/**
 * Renders a form for users to submit their email to receive a password reset link.
 */
const ForgotPasswordForm = ({ setPage }) => {
    const { handleForgotPassword } = useAuth();
    const { isLoading } = useUI();
    const [userEmail, setUserEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await handleForgotPassword(userEmail);
        if (success) {
            setPage('booking');
            setUserEmail('');
        }
    };

    return (
        <div className="max-w-md w-full bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-lg animate-fade-in-up">
            <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Forgot Password</h2>
            <p className="text-center text-slate-500 mb-6">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                    <input 
                        type="email" 
                        id="email" 
                        value={userEmail} 
                        onChange={(e) => setUserEmail(e.target.value)} 
                        className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
                        required 
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full flex justify-center bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <p className="text-center">
                    <button 
                        type="button"
                        onClick={() => setPage('booking')} 
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Back to Home
                    </button>
                </p>
            </form>
        </div>
    );
};

export default ForgotPasswordForm;
