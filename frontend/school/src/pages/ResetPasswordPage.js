import React from 'react';

// Import layout and shared components
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';
import Notification from '../components/shared/Notification';
import { useUI } from '../hooks/useUI';

/**
 * A dedicated page for users to reset their password using a token from their email.
 */
const ResetPasswordPage = ({ setPage, token }) => {
    const { notification } = useUI();

    return (
         <>
            <style>{`
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fade-in-up 0.6s ease-in-out forwards; }
            `}</style>

            <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
                <div className="container mx-auto p-4 sm:p-8 max-w-7xl">
                    <Header setPage={setPage} />
                    <main className="min-h-[70vh] flex items-center justify-center">
                       <ResetPasswordForm setPage={setPage} token={token} />
                    </main>
                    <Footer />
                </div>
                <Notification {...notification} />
            </div>
        </>
    );
};

export default ResetPasswordPage;
