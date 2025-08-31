import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../hooks/useUI';

/**
 * Renders a form for the user to enter and confirm a new password.
 * It uses the reset token passed in as a prop.
 */
const ResetPasswordForm = ({ setPage, token }) => {
    const { resetPassword } = useAuth();
    const { isLoading } = useUI();
    const [userPassword, setUserPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await resetPassword(userPassword, token);
        if (success) {
            // After successful password reset, the user is logged in.
            // Navigate them back to the main booking page.
            setPage('booking');
        }
    };

    return (
        <div className="max-w-md w-full bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-lg animate-fade-in-up">
            <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Reset Password</h2>
            <p className="text-center text-slate-500 mb-6">Enter a new password for your account.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-slate-700">New Password</label>
                    <input 
                        type="password" 
                        id="new-password" 
                        value={userPassword} 
                        onChange={(e) => setUserPassword(e.target.value)} 
                        className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
                        placeholder="••••••••" 
                        required 
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full flex justify-center bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                >
                    {isLoading ? 'Updating...' : 'Set New Password'}
                </button>
            </form>
        </div>
    );
};

export default ResetPasswordForm;
