// src/App.js

import React, { useState, useEffect } from 'react';

// Context provider that will bundle all other contexts
import { AppProviders } from './context/AppProviders';

// Import the main pages of the application
import BookingPage from './pages/BookingPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// The main App component is now much simpler
const App = () => {
    // 'page' state now acts as a simple router
    const [page, setPage] = useState('booking');
    // State to hold the token from the URL for password resets
    const [resetToken, setResetToken] = useState(null);

    // This effect checks the URL when the app loads to handle password reset links
    useEffect(() => {
        const path = window.location.pathname;
        if (path.startsWith('/reset-password/')) {
            const tokenFromUrl = path.split('/')[2];
            if (tokenFromUrl) {
                setResetToken(tokenFromUrl);
                setPage('resetPassword');
            }
        }
    }, []);

    // Function to render the correct page based on the 'page' state
    const renderPage = () => {
        switch (page) {
            case 'forgotPassword':
                return <ForgotPasswordPage setPage={setPage} />;
            case 'resetPassword':
                return <ResetPasswordPage setPage={setPage} token={resetToken} />;
            case 'booking':
            default:
                return <BookingPage setPage={setPage} />;
        }
    };

    return (
        <AppProviders>
            {/* This is the main entry point for your UI.
              You can easily add more pages to the switch statement above.
            */}
            {renderPage()}
        </AppProviders>
    );
};

export default App;