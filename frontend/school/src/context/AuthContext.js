import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useUI } from './UIContext';

// --- Configuration ---
const BACKEND_URL = 'http://localhost:3000';

// Create a context for handling authentication and user data.
const AuthContext = createContext();

// Export a custom hook for easy consumption.
export const useAuth = () => useContext(AuthContext);

// Define the provider component.
export const AuthProvider = ({ children }) => {
    const { setIsLoading, showAppNotification } = useUI();
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(null);

    /**
     * Logs the user out by clearing their token and user data from state and localStorage.
     */
    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        showAppNotification('You have been logged out.', 'success');
    }, [showAppNotification]);

    /**
     * Decodes a JWT and retrieves user data from localStorage to populate the user state.
     * If the token is invalid or doesn't match the stored user, it logs the user out.
     * @param {string} currentToken - The JWT to process.
     */
    const fetchUser = useCallback(async (currentToken) => {
        if (!currentToken) return;
        try {
            // NOTE: A more robust solution would be a '/api/me' endpoint to verify the token
            // against the backend and get the latest user data. This implementation trusts localStorage.
            const payload = JSON.parse(atob(currentToken.split('.')[1]));
            const userObject = JSON.parse(localStorage.getItem('user'));

            if (userObject && payload.id === userObject._id) {
                setUser(userObject);
            } else {
                console.error("Token-user mismatch or missing user data.");
                logout();
            }
        } catch (error) {
            console.error("Invalid token or user data in localStorage:", error);
            logout();
        }
    }, [logout]);
    
    // On initial app load, check for a stored token and fetch user data if it exists.
    useEffect(() => {
        if (token) {
            fetchUser(token);
        }
    }, [token, fetchUser]);
    
    /**
     * Handles successful authentication by storing token and user data.
     * @param {object} data - The successful response from the login/register API.
     */
    const handleAuthSuccess = (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setToken(data.token);
        setUser(data.data.user);
        showAppNotification('Success! You are now logged in.', 'success');
        return data.data.user; // Return user object for immediate use.
    };

    const register = async (name, email, password) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return handleAuthSuccess(data);
        } catch (err) {
            showAppNotification(err.message || 'Registration failed.');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return handleAuthSuccess(data);
        } catch (err) {
            showAppNotification(err.message || 'Login failed.');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const forgotPassword = async (email) => {
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
        } catch(err) {
            showAppNotification(err.message || 'Failed to send reset link.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };
    
    const resetPassword = async (newPassword, resetToken) => {
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
            
            // Assuming the reset endpoint response includes the user object and a new token
            handleAuthSuccess(data);
            window.history.pushState({}, '', '/');
            return true;

        } catch(err) {
            showAppNotification(err.message || 'Failed to reset password.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const value = { token, user, login, register, logout, forgotPassword, resetPassword };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
