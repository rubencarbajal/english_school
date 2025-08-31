import React from 'react';

// Import hooks to access and manage global state
import { useBooking } from '../hooks/useBooking';
import { useUI } from '../hooks/useUI';
import { useAuth } from '../hooks/useAuth';

// Import layout components
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

// Import feature-specific components for the booking flow
import PlanSelector from '../components/booking/PlanSelector';
import SchedulePicker from '../components/booking/SchedulePicker';
import CheckoutSummary from '../components/booking/CheckoutSummary';
import AuthForm from '../components/auth/AuthForm';

// Import shared components
import Testimonials from '../components/shared/Testimonials';
import Notification from '../components/shared/Notification';

/**
 * The main page for the class booking experience.
 * It orchestrates the multi-step process from plan selection to confirmation.
 */
const BookingPage = ({ setPage }) => {
    // Access state and functions from contexts via hooks
    const { currentStep, selectedPlan, paymentSummary } = useBooking();
    const { user } = useAuth();
    const { notification } = useUI();

    // Conditionally renders the main content based on the current step in the booking flow
    const renderContent = () => {
        switch (currentStep) {
            case 'schedule':
                return <SchedulePicker />;
            case 'checkout':
                return <AuthForm />;
            case 'payment':
                // The payment step requires both a summary and a logged-in user
                if (paymentSummary && user) {
                    return <CheckoutSummary />;
                }
                // If user is not logged in, redirect to the account creation/login step
                return <AuthForm />;
            case 'plan':
            default:
                return (
                    <>
                        <header className="text-center my-12 md:my-20 animate-fade-in-up">
                            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
                                Unlock Your <span className="text-indigo-600">English Potential</span>
                            </h1>
                            <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
                                Join thousands of students achieving fluency with our personalized plans. Choose a package that fits your goals and schedule your first class with an expert tutor in minutes.
                            </p>
                        </header>
                        <main>
                            <PlanSelector />
                            <Testimonials />
                        </main>
                    </>
                );
        }
    };

    return (
        <>
            {/* Inline styles for animations */}
            <style>{`
                @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
                .animate-blob { animation: blob 7s infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fade-in-up 0.6s ease-in-out forwards; }
            `}</style>

            <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased relative isolate overflow-hidden">
                {/* Animated background blobs */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-[-20%] left-[10%] w-96 h-96 bg-purple-200/50 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
                    <div className="absolute top-[10%] right-[5%] w-96 h-96 bg-sky-200/50 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-[-10%] left-[25%] w-96 h-96 bg-pink-200/50 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
                </div>

                <div className="container mx-auto p-4 sm:p-8 max-w-7xl">
                    <Header setPage={setPage} />
                    
                    {/* Render the appropriate content for the current step */}
                    {renderContent()}

                    <Footer />
                </div>
                
                {/* Notification component to display messages */}
                <Notification {...notification} />
            </div>
        </>
    );
};

export default BookingPage;
