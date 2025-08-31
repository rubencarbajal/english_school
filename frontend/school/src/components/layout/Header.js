import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useBooking } from '../../hooks/useBooking';

/**
 * The main header for the application.
 * Displays the site title and authentication status (login/logout button).
 */
const Header = ({ setPage }) => {
    // Get user and logout function from AuthContext
    const { user, logout } = useAuth();
    // Get booking state management from BookingContext
    const { setCurrentStep } = useBooking();

    // Handle user logout
    const handleLogout = () => {
        logout();
        // Reset the booking flow to the beginning on logout
        setCurrentStep('plan');
    };

    // Navigate to the plan selection step
    const goToHome = () => {
        setPage('booking');
        setCurrentStep('plan');
    };
    
    // Navigate to the login view within the checkout flow
    const goToLogin = () => {
        setPage('booking');
        setCurrentStep('checkout');
    };

    return (
        <header className="flex justify-between items-center my-8 md:my-12 animate-fade-in-up">
            <div 
                className="text-2xl font-bold text-slate-900 cursor-pointer" 
                onClick={goToHome}
            >
                Fluent English
            </div>
            {user ? (
                <div className="flex items-center gap-4">
                    <span className="text-slate-600 hidden sm:inline">
                        Welcome, <span className="font-semibold">{user.name.split(' ')[0]}</span>!
                    </span>
                    <button 
                        onClick={handleLogout} 
                        className="bg-indigo-100 text-indigo-700 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-200 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            ) : (
               <button 
                    onClick={goToLogin} 
                    className="bg-indigo-100 text-indigo-700 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-200 transition-colors"
                >
                    Student Login
                </button>
            )}
        </header>
    );
};

export default Header;
