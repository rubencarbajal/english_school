import React, { createContext, useState, useCallback, useContext } from 'react';

// Create a context for UI-related state like notifications and loaders.
const UIContext = createContext();

// Export a custom hook to easily access the context's values.
export const useUI = () => useContext(UIContext);

// Define the provider component that will wrap the application.
export const UIProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'error' });

    /**
     * Shows a notification message for a few seconds.
     * @param {string} message - The message to display.
     * @param {string} [type='error'] - The type of notification ('error' or 'success').
     * @param {number} [duration=3000] - How long to show the message in milliseconds.
     */
    const showAppNotification = useCallback((message, type = 'error', duration = 3000) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type }), duration);
    }, []);

    // The value provided to all consuming components.
    const value = {
        isLoading,
        setIsLoading,
        notification,
        showAppNotification,
    };

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
