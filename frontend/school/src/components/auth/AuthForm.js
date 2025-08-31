import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../hooks/useUI';
import { useBooking } from '../../hooks/useBooking';

/**
 * A component that renders a tabbed form for user registration and login.
 */
const AuthForm = () => {
    // Hooks for state and actions
    const { login, register } = useAuth();
    const { isLoading } = useUI();
    const { setCurrentStep, generatePaymentSummary } = useBooking();
    
    // Local state for the form
    const [authMode, setAuthMode] = useState('register'); // 'register' or 'login'
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        const newUser = await register(userName, userEmail, userPassword);
        if (newUser) {
            // If registration is successful, proceed to the payment step
            generatePaymentSummary();
            setCurrentStep('payment');
        }
    };
    
    const handleLogin = async (e) => {
        e.preventDefault();
        const loggedInUser = await login(userEmail, userPassword);
        if (loggedInUser) {
            // If login is successful, proceed to the payment step
            generatePaymentSummary();
            setCurrentStep('payment');
        }
    };

    return (
        <div className="bg-white max-w-2xl mx-auto p-8 rounded-3xl shadow-2xl border animate-fade-in-up">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Step 3: Your Account</h2>
                <p className="mt-2 text-lg text-slate-600 max-w-2xl mx-auto">Create an account to manage your bookings and track your progress.</p>
            </div>
            <div className="mb-8">
                <div className="flex border-b border-slate-200">
                    <button  
                        onClick={() => setAuthMode('register')}
                        className={`flex-1 py-3 text-center font-semibold transition-colors duration-300 ${authMode === 'register' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Create Account
                    </button>
                    <button  
                        onClick={() => setAuthMode('login')}
                        className={`flex-1 py-3 text-center font-semibold transition-colors duration-300 ${authMode === 'login' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        I Have an Account
                    </button>
                </div>
            </div>

            {authMode === 'register' ? (
                <form onSubmit={handleRegister} className="space-y-6 animate-fade-in-up">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                        <input type="text" id="name" value={userName} onChange={(e) => setUserName(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                        <input type="email" id="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                        <input type="password" id="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Minimum 8 characters" required />
                    </div>
                    <div className="flex flex-col sm:flex-row-reverse items-center gap-4 pt-4">
                        <button type="submit" disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:bg-indigo-400">
                            {isLoading ? 'Creating...' : 'Create Account & Continue'}
                        </button>
                        <button type="button" onClick={() => setCurrentStep('schedule')} className="w-full sm:w-auto text-slate-600 font-semibold py-3 px-6 rounded-lg hover:bg-slate-100 transition-colors">
                            Back to Schedule
                        </button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleLogin} className="space-y-6 animate-fade-in-up">
                    <div>
                        <label htmlFor="login-email" className="block text-sm font-medium text-slate-700">Email Address</label>
                        <input type="email" id="login-email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                    </div>
                    <div>
                        <div className="flex justify-between items-center">
                            <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">Password</label>
                            <button type="button" onClick={() => setCurrentStep('forgotPassword')} className="text-sm text-indigo-600 hover:text-indigo-500">Forgot password?</button>
                        </div>
                        <input type="password" id="login-password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                    </div>
                    <div className="flex flex-col sm:flex-row-reverse items-center gap-4 pt-4">
                        <button type="submit" disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:bg-indigo-400">
                            {isLoading ? 'Logging In...' : 'Login & Continue'}
                        </button>
                        <button type="button" onClick={() => setCurrentStep('schedule')} className="w-full sm:w-auto text-slate-600 font-semibold py-3 px-6 rounded-lg hover:bg-slate-100 transition-colors">
                            Back to Schedule
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AuthForm;
