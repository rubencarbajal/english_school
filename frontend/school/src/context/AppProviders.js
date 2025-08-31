import React from 'react';
import { UIProvider } from './UIContext';
import { AuthProvider } from './AuthContext';
import { BookingProvider } from './BookingContext';

/**
 * A wrapper component that combines all the app's context providers into one.
 * This keeps the main App.js file clean and makes it easy to add new global providers.
 * The order is important: outer providers' values are available to inner providers.
 */
export const AppProviders = ({ children }) => {
    return (
        <UIProvider>
            <AuthProvider>
                <BookingProvider>
                    {children}
                </BookingProvider>
            </AuthProvider>
        </UIProvider>
    );
};
