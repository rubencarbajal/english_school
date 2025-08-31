import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useUI } from '../hooks/useUI';

// --- Configuration ---
const BACKEND_URL = 'http://localhost:3000';

// Create a context for managing authentication state.
const AuthContext = createContext();

// Export a custom hook for easy consumption of this context.
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const { setIsLoading, showAppNotification } = useUI();

    // Auth & User state
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [authMode, setAuthMode] = useState('register');
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        showAppNotification('You have been logged out.', 'success');
    }, [showAppNotification]);

    const fetchUser = useCallback(async (currentToken) => {
        if (currentToken) {
            try {
                const payload = JSON.parse(atob(currentToken.split('.')[1]));
                const userObject = JSON.parse(localStorage.getItem('user'));

                if (userObject && payload.id === userObject._id) {
                    setUser(userObject);
                } else {
                    console.error("User data mismatch, logging out.");
                    logout();
                }
            } catch (error) {
                console.error("Invalid token or user data:", error);
                logout();
            }
        }
    }, [logout]);

    useEffect(() => {
        if (token) {
            fetchUser(token);
        }
    }, [token, fetchUser]);

    const handleAuthSuccess = (data, successMessage) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setToken(data.token);
        setUser(data.data.user);
        setUserName(data.data.user.name);
        setUserEmail(data.data.user.email);
        showAppNotification(successMessage, 'success');
        return data.data.user; // Return user object on success
    };

    const registerUser = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: userName, email: userEmail, password: userPassword }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return handleAuthSuccess(data, 'Success! You are now logged in.');
        } catch (err) {
            showAppNotification(err.message || 'Registration failed.');
            return null; // Return null on failure
        } finally {
            setIsLoading(false);
        }
    };

    const loginUser = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, password: userPassword }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return handleAuthSuccess(data, 'Welcome back!');
        } catch (err) {
            showAppNotification(err.message || 'Login failed.');
            return null; // Return null on failure
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (email) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            showAppNotification(data.message, 'success');
            return true;
        } catch (err) {
            showAppNotification(err.message || 'Failed to send reset link.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (newPassword, resetToken) => {
        if (newPassword.length < 8) {
            showAppNotification('Password must be at least 8 characters long.');
            return false;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/reset-password/${resetToken}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: newPassword }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            handleAuthSuccess(data, 'Password reset successfully! You are now logged in.');
            window.history.pushState({}, '', '/');
            return true;
        } catch (err) {
            showAppNotification(err.message || 'Failed to reset password.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        token,
        user,
        authMode,
        setAuthMode,
        userName,
        setUserName,
        userEmail,
        setUserEmail,
        userPassword,
        setUserPassword,
        registerUser,
        loginUser,
        logout,
        handleForgotPassword,
        handleResetPassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

