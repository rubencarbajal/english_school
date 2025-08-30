import React, { useState, useEffect, useCallback } from 'react';

// --- Configuration ---
const BACKEND_URL = 'http://localhost:3000'; 

// --- Static Data ---
const coursePlans = {
  plan1: {
    id: 'plan1',
    name: 'Trial Class',
    pricePerClass: 150,
    totalClasses: 1,
    duration: 'Single Session',
    description: 'A single trial class to experience our method.',
    features: ['45-minute live session', 'Personalized feedback', 'Introduction to curriculum'],
    badge: null,
  },
  plan5: {
    id: 'plan5',
    name: 'Explorer Pack',
    pricePerClass: 100,
    totalClasses: 5,
    duration: 'Valid for 2 weeks',
    description: 'Perfect for getting comfortable and seeing progress.',
    features: ['5 live sessions', 'Flexible scheduling', 'Access to practice materials', 'Progress tracking'],
    badge: 'Most Popular',
  },
  plan10: {
    id: 'plan10',
    name: 'Immersion Pack',
    pricePerClass: 90,
    totalClasses: 10,
    duration: 'Valid for 1 month',
    description: 'The complete package for serious, rapid improvement.',
    features: ['10 live sessions', 'Priority scheduling', 'All practice materials', 'Dedicated support'],
    badge: 'Best Value',
  },
};

const testimonials = [
    {
        quote: "The classes are incredibly dynamic. I've learned more in one month here than in a year elsewhere! The native tutors are very patient.",
        name: "Anna S.",
        title: "Marketing Student"
    },
    {
        quote: "The flexible scheduling is perfect for my agenda. I can book classes whenever it suits me, and the progress is noticeable. I highly recommend it.",
        name: "Carlos G.",
        title: "Software Developer"
    },
    {
        quote: "I finally feel confident speaking English in my work meetings. The platform is easy to use, and the support is excellent.",
        name: "Maria V.",
        title: "Project Manager"
    }
];


// --- Helper Components ---
const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);
const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>
);
const Notification = ({ message, show, type = 'error' }) => {
    const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
    return (
        <div className={`fixed inset-x-0 bottom-8 z-50 flex justify-center transition-all duration-500 ${show ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
            <div className={`${bgColor} text-white p-4 rounded-xl shadow-2xl max-w-sm w-full mx-4 sm:mx-0 text-center`}>
                <p className="font-semibold">{message}</p>
            </div>
        </div>
    );
};


// --- Main App Component ---
const App = () => {
    // Page routing state
    const [page, setPage] = useState('booking'); // 'booking', 'forgotPassword', 'resetPassword'
    const [resetToken, setResetToken] = useState(null);

    // Booking flow state
    const [currentStep, setCurrentStep] = useState('plan'); // 'plan', 'schedule', 'checkout', 'payment'
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedDates, setSelectedDates] = useState([]);
    const [paymentSummary, setPaymentSummary] = useState(null);
    const [classAvailability, setClassAvailability] = useState({});
    
    // Auth & User state
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [authMode, setAuthMode] = useState('register');
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');
    
    // Generic UI state
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'error' });

    const showAppNotification = useCallback((message, type = 'error', duration = 3000) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type }), duration);
    }, []);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setCurrentStep('plan');
        showAppNotification('You have been logged out.', 'success');
    }, [showAppNotification]);

    // --- Effects for Initialization and Auth ---

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

    const fetchUser = useCallback(async (currentToken) => {
        if (currentToken) {
            try {
                const payload = JSON.parse(atob(currentToken.split('.')[1]));
                const userObject = JSON.parse(localStorage.getItem('user'));
                
                if(userObject && payload.id === userObject._id) {
                     setUser(userObject);
                } else {
                    handleLogout();
                }
            } catch (error) {
                console.error("Invalid token or user data:", error);
                handleLogout();
            }
        }
    }, [handleLogout]);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            fetchUser(storedToken);
        }
    }, [fetchUser]);

    useEffect(() => {
        const fetchAvailability = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${BACKEND_URL}/api/availability`);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setClassAvailability(data);
            } catch (err) {
                showAppNotification('Could not load class schedule.');
            } finally {
                setIsLoading(false);
            }
        };

        if (currentStep === 'schedule') {
            fetchAvailability();
        }
    }, [currentStep, showAppNotification]);

    // --- Authentication Handlers ---

    const handleAuthSuccess = (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setToken(data.token);
        setUser(data.data.user);
        setUserName(data.data.user.name); 
        setUserEmail(data.data.user.email);
        showAppNotification('Success! You are now logged in.', 'success');
        setCurrentStep('payment');
    };
    
    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: userName, email: userEmail, password: userPassword }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            handleAuthSuccess(data);
        } catch (err) {
            showAppNotification(err.message || 'Registration failed.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, password: userPassword }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            handleAuthSuccess(data);
        } catch (err) {
            showAppNotification(err.message || 'Login failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            showAppNotification(data.message, 'success');
            setPage('booking'); 
            setUserEmail('');
        } catch(err) {
            showAppNotification(err.message || 'Failed to send reset link.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (userPassword.length < 8) {
            showAppNotification('Password must be at least 8 characters long.');
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/reset-password/${resetToken}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: userPassword }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            localStorage.setItem('token', data.token);
            setToken(data.token);
            showAppNotification('Password reset successfully! You are now logged in.', 'success');
            window.history.pushState({}, '', '/'); 
            setPage('booking');
            setCurrentStep('plan');
            fetchUser(data.token);

        } catch(err) {
            showAppNotification(err.message || 'Failed to reset password.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Booking Flow Handlers ---
    
    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
        setSelectedDates([]);
        setCurrentStep('schedule');
    };
    
    const handleClassSelection = (date, time) => {
        const isAlreadySelected = selectedDates.some(d => d.date === date && d.time === time);

        if (isAlreadySelected) {
            setSelectedDates(selectedDates.filter(d => d.date !== date || d.time !== time));
        } else {
            if ((classAvailability[date]?.[time] || 0) <= 0) {
                showAppNotification('This time slot is already booked.');
                return;
            }
            if (selectedDates.length >= selectedPlan.totalClasses) {
                showAppNotification(`You can only select ${selectedPlan.totalClasses} class(es) for the ${selectedPlan.name}.`);
                return;
            }
            setSelectedDates([...selectedDates, { date, time }]);
        }
    };

    const handleProceedToCheckout = () => {
        if (selectedDates.length !== selectedPlan.totalClasses) {
            showAppNotification(`Please select exactly ${selectedPlan.totalClasses} class(es).`);
            return;
        }
        const totalCost = selectedDates.length * selectedPlan.pricePerClass;
        setPaymentSummary({ plan: selectedPlan, classes: selectedDates, totalCost });

        if (token && user) {
            setUserName(user.name);
            setUserEmail(user.email);
            setCurrentStep('payment');
        } else {
            setAuthMode('register');
            setUserEmail('');
            setUserName('');
            setUserPassword('');
            setCurrentStep('checkout');
        }
    };

    const handleConfirmBooking = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    planId: paymentSummary.plan.id,
                    selectedClasses: paymentSummary.classes,
                    totalCost: paymentSummary.totalCost,
                    currency: 'MXN'
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            showAppNotification('Your classes have been booked successfully!', 'success');
            setTimeout(() => {
                setCurrentStep('plan');
                setSelectedPlan(null);
                setSelectedDates([]);
                setPaymentSummary(null);
            }, 3500);
        } catch (err) {
            showAppNotification(err.message || 'Booking failed.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderDateGrid = () => {
        const today = new Date();
        const futureDates = Array.from({ length: 14 }, (_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            return date.toISOString().split('T')[0];
        });

        const timeSlots = ['10:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM'];

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {futureDates.map(date => {
                    const dayOfWeek = new Date(date + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
                    const formattedDate = new Date(date + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
                    
                    return (
                        <div key={date} className="bg-white/50 backdrop-blur-sm p-5 rounded-2xl border border-gray-200/80 shadow-md hover:shadow-lg transition-shadow duration-300">
                            <h4 className="font-bold text-gray-800 capitalize">{dayOfWeek}</h4>
                            <p className="text-sm text-gray-500 mb-4">{formattedDate}</p>
                            <div className="grid grid-cols-2 gap-3">
                                {timeSlots.map(time => {
                                    const isSelected = selectedDates.some(d => d.date === date && d.time === time);
                                    const isAvailable = (classAvailability[date]?.[time] || 0) > 0;
                                    let btnClass = 'p-2 rounded-lg text-sm transition-all duration-300 ease-in-out border-2 font-semibold ';
                                    
                                    if (isSelected) {
                                        btnClass += 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105 transform';
                                    } else if (isAvailable) {
                                        btnClass += 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-400 transform hover:scale-105';
                                    } else {
                                        btnClass += 'bg-slate-200 text-slate-400 border-slate-200 cursor-not-allowed line-through';
                                    }

                                    return (
                                        <button key={time} className={btnClass} onClick={() => handleClassSelection(date, time)} disabled={!isAvailable && !isSelected}>
                                            {time}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderContent = () => {
        if (page === 'forgotPassword') {
            return (
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="max-w-md w-full bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-lg animate-fade-in-up">
                        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Forgot Password</h2>
                        <p className="text-center text-slate-500 mb-6">Enter your email and we'll send you a reset link.</p>
                        <form onSubmit={handleForgotPassword} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                                <input type="email" id="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full flex justify-center bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                            <p className="text-center"><a href="#" onClick={(e) => { e.preventDefault(); setPage('booking'); }} className="font-medium text-indigo-600 hover:text-indigo-500">Back to Home</a></p>
                        </form>
                    </div>
                </div>
            );
        }
        
        if (page === 'resetPassword') {
            return (
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="max-w-md w-full bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-lg animate-fade-in-up">
                        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Reset Password</h2>
                        <p className="text-center text-slate-500 mb-6">Enter a new password for your account.</p>
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <label htmlFor="new-password" className="block text-sm font-medium text-slate-700">New Password</label>
                                <input type="password" id="new-password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="••••••••" required />
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full flex justify-center bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
                                {isLoading ? 'Updating...' : 'Set New Password'}
                            </button>
                        </form>
                    </div>
                </div>
            );
        }
        
        return (
            <main>
                {currentStep === 'plan' && (
                    <div className="text-center animate-fade-in-up mb-12">
                        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Step 1: Choose Your Perfect Plan</h2>
                        <p className="mt-2 text-lg text-slate-600 max-w-2xl mx-auto">We offer flexible packages to match your learning pace and budget.</p>
                    </div>
                )}
                {currentStep === 'plan' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
                        {Object.values(coursePlans).map(plan => (
                            <div key={plan.id} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-8 flex flex-col transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl relative border-2 border-transparent hover:border-indigo-500/50">
                                {plan.badge && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">{plan.badge}</div>}
                                <h2 className="text-2xl font-bold text-slate-900">{plan.name}</h2>
                                <p className="text-slate-500 mt-2 flex-grow">{plan.description}</p>
                                <div className="my-6">
                                    <span className="text-5xl font-extrabold text-slate-900">${plan.pricePerClass}</span>
                                    <span className="text-lg text-slate-500">/class</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center text-slate-600">
                                            <Icon path="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-5 h-5 text-green-500 mr-3"/>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => handleSelectPlan(plan)} className="mt-auto w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                                    Choose Plan
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {currentStep === 'plan' && (
                    <section className="mt-24 text-center animate-fade-in-up">
                        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">What Our Students Say</h2>
                        <p className="mt-2 text-lg text-slate-600 max-w-2xl mx-auto">Real stories from students who transformed their English with us.</p>
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                            {testimonials.map((testimonial, i) => (
                                <figure key={i} className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-lg">
                                    <blockquote className="text-slate-600 italic">“{testimonial.quote}”</blockquote>
                                    <figcaption className="mt-6">
                                        <div className="font-semibold text-slate-900">{testimonial.name}</div>
                                        <div className="text-slate-500 text-sm">{testimonial.title}</div>
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                    </section>
                )}

                {currentStep === 'schedule' && selectedPlan && (
                    <div className="bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 animate-fade-in-up">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Step 2: Schedule Your Classes</h2>
                            <p className="mt-2 text-lg text-slate-600 max-w-2xl mx-auto">Our calendar shows real-time availability. Select your preferred times.</p>
                        </div>
                        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
                            <div>
                                <p className="text-slate-500 mt-1">You've selected the <strong>{selectedPlan.name}</strong>. Please book {selectedPlan.totalClasses} session(s).</p>
                            </div>
                            <div className="mt-4 md:mt-0 text-lg font-semibold bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg">
                                Selected: {selectedDates.length} / {selectedPlan.totalClasses}
                            </div>
                        </div>
                        {isLoading ? <LoadingSpinner /> : renderDateGrid()}
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
                            <button onClick={() => setCurrentStep('plan')} className="text-slate-600 font-semibold py-3 px-6 rounded-lg hover:bg-slate-100 transition-colors">
                                Back to Plans
                            </button>
                            <button onClick={handleProceedToCheckout} disabled={selectedDates.length !== selectedPlan.totalClasses} className="w-full sm:w-auto bg-green-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-600 transition-all duration-300 shadow-md hover:shadow-lg disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105">
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 'checkout' && paymentSummary && (
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
                                    <input type="password" id="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
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
                                        <a href="#" onClick={(e) => { e.preventDefault(); setPage('forgotPassword'); }} className="text-sm text-indigo-600 hover:text-indigo-500">Forgot password?</a>
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
                )}
                
                {currentStep === 'payment' && paymentSummary && user && (
                    <div className="bg-white max-w-2xl mx-auto p-8 rounded-3xl shadow-2xl border animate-fade-in-up">
                        <h3 className="text-3xl font-bold text-center text-slate-800 mb-2">Final Step: Confirm Your Booking</h3>
                        <p className="text-center text-slate-500 mb-6">Review your details below and finalize your plan.</p>
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-slate-600">Plan</p>
                                <p className="font-bold text-slate-800">{paymentSummary.plan.name}</p>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-slate-600">Student Name</p>
                                <p className="font-bold text-slate-800">{user.name}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-slate-600">Student Email</p>
                                <p className="font-bold text-slate-800">{user.email}</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-700 mb-3">Selected Classes:</h4>
                            <ul className="space-y-3">
                                {paymentSummary.classes.map((c, i) => (
                                    <li key={i} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        <div className="flex items-center">
                                            <Icon path="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" className="w-5 h-5 text-indigo-500 mr-3"/>
                                            <span>{new Date(c.date + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>
                                        </div>
                                        <span className="font-semibold text-slate-800">{c.time}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="border-t my-6"></div>
                        <div className="flex justify-between items-center text-xl">
                            <span className="font-bold text-slate-800">Total to Pay:</span>
                            <span className="text-3xl font-extrabold text-green-600">${paymentSummary.totalCost} MXN</span>
                        </div>
                        <div className="flex flex-col sm:flex-row-reverse justify-center items-center gap-4 mt-8">
                            <button onClick={handleConfirmBooking} disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:bg-indigo-400">
                                {isLoading ? (<div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>) : 'Confirm & Book Classes'}
                            </button>
                            <button type="button" onClick={() => user ? setCurrentStep('schedule') : setCurrentStep('checkout')} className="w-full sm:w-auto text-slate-600 font-semibold py-3 px-6 rounded-lg hover:bg-slate-100 transition-colors">
                                Back
                            </button>
                        </div>
                    </div>
                )}
            </main>
        );
    };

    return (
        <>
            <style>{`
                @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
                .animate-blob { animation: blob 7s infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fade-in-up 0.6s ease-in-out forwards; }
            `}</style>
            <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased relative isolate overflow-hidden">
                 <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-[-20%] left-[10%] w-96 h-96 bg-purple-200/50 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
                    <div className="absolute top-[10%] right-[5%] w-96 h-96 bg-sky-200/50 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-[-10%] left-[25%] w-96 h-96 bg-pink-200/50 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
                </div>
                <div className="container mx-auto p-4 sm:p-8 max-w-7xl">
                    <header className="flex justify-between items-center my-8 md:my-12 animate-fade-in-up">
                        <div className="text-2xl font-bold text-slate-900 cursor-pointer" onClick={() => { setPage('booking'); setCurrentStep('plan'); }}>Fluent English</div>
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-slate-600 hidden sm:inline">Welcome, <span className="font-semibold">{user.name.split(' ')[0]}</span>!</span>
                                <button onClick={handleLogout} className="bg-indigo-100 text-indigo-700 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-200 transition-colors">Logout</button>
                            </div>
                        ) : (
                           <button onClick={() => { setCurrentStep('checkout'); setAuthMode('login'); }} className="bg-indigo-100 text-indigo-700 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-200 transition-colors">
                                Student Login
                           </button>
                        )}
                    </header>
                    
                    {page === 'booking' && currentStep === 'plan' && (
                        <header className="text-center my-12 md:my-20 animate-fade-in-up">
                            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
                                Unlock Your <span className="text-indigo-600">English Potential</span>
                            </h1>
                            <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
                                Join thousands of students achieving fluency with our personalized plans. Choose a package that fits your goals and schedule your first class with an expert tutor in minutes.
                            </p>
                        </header>
                    )}

                    {renderContent()}

                    <footer className="text-center mt-24 py-8 border-t border-slate-200 text-slate-500">
                        <p>&copy; {new Date().getFullYear()} Fluent English. All rights reserved.</p>
                        <p className="text-sm mt-2">Built with passion for learners worldwide.</p>
                    </footer>
                </div>
                <Notification {...notification} />
            </div>
        </>
    );
};

export default App;

