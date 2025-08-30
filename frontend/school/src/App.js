import React, { useState, useEffect } from 'react';

// --- Configuration ---
// In a real app, this would come from an environment variable
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

// --- Helper Components for a cleaner structure ---

const Icon = ({ path, className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
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
  // State Management
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [currentStep, setCurrentStep] = useState('plan'); // 'plan', 'schedule', 'checkout', 'payment'
  const [classAvailability, setClassAvailability] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'error' });
  const [authMode, setAuthMode] = useState('register'); // 'register' or 'login'
  
  // User account state
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userId, setUserId] = useState(null);

  // --- API Communication ---

  // Fetch class availability from the backend whenever the user enters the 'schedule' step.
  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${BACKEND_URL}/api/availability`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setClassAvailability(data);
      } catch (err) {
        console.error("Failed to fetch availability:", err);
        setError('Could not load class schedule. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    // This logic ensures fresh data is fetched every time the user selects a plan.
    if (currentStep === 'schedule') {
      fetchAvailability();
    }
  }, [currentStep]); // The effect re-runs whenever 'currentStep' changes.
  
  // --- Event Handlers ---

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setSelectedDates([]);
    setCurrentStep('schedule');
  };

  const showAppNotification = (message, type = 'error', duration = 3000) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type }), duration);
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
    setPaymentSummary({
        plan: selectedPlan,
        classes: selectedDates,
        totalCost,
    });
    // Reset auth form fields for a clean state
    setAuthMode('register');
    setUserEmail('');
    setUserName('');
    setUserPassword('');
    setCurrentStep('checkout');
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    if (!userName || !userEmail || !userPassword) {
      showAppNotification('Please fill out all fields to create your account.');
      return;
    }
    // --- Account Creation Simulation ---
    // In a real app, you would POST to /api/register and get a user object back
    console.log('Creating account for:', { userName, userEmail });
    const newUserId = `user_${crypto.randomUUID().slice(0, 8)}`;
    setUserId(newUserId);
    showAppNotification('Account created successfully!', 'success');
    
    setTimeout(() => {
        setCurrentStep('payment');
    }, 1500);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!userEmail || !userPassword) {
        showAppNotification('Please enter your email and password.');
        return;
    }
    // --- Login Simulation ---
    // In a real app, you would POST to /api/login and get user details
    console.log('Simulating login for:', userEmail);
    const simulatedName = userEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    setUserName(simulatedName);
    
    const newUserId = `user_${crypto.randomUUID().slice(0, 8)}`;
    setUserId(newUserId);
    showAppNotification(`Welcome back, ${simulatedName}!`, 'success');

    setTimeout(() => {
        setCurrentStep('payment');
    }, 1500);
  };


  const handleConfirmBooking = async () => {
    setIsLoading(true);
    setError(null);

    const bookingDetails = {
        userId: userId,
        userName: userName,
        userEmail: userEmail,
        planId: paymentSummary.plan.id,
        selectedClasses: paymentSummary.classes,
        totalCost: paymentSummary.totalCost,
        currency: 'MXN',
        paymentAuthorized: true, 
        bookingDate: new Date().toISOString(),
    };

    try {
        const response = await fetch(`${BACKEND_URL}/api/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingDetails),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Booking failed. Please try again.');
        }

        const result = await response.json();
        console.log('Booking successful:', result);
        showAppNotification('Your classes have been booked successfully!', 'success');
        
        setTimeout(() => {
            setCurrentStep('plan');
            setSelectedPlan(null);
            setSelectedDates([]);
            setPaymentSummary(null);
            setUserId(null);
            setUserName('');
            setUserEmail('');
        }, 3500);

    } catch (err) {
        console.error("Booking failed:", err);
        showAppNotification(err.message || 'An unexpected error occurred.', 'error');
    } finally {
        setIsLoading(false);
    }
  };

  // --- Rendering Logic ---

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
                const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
                const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
                
                return (
                    <div key={date} className="bg-white/50 backdrop-blur-sm p-5 rounded-2xl border border-gray-200/80 shadow-md hover:shadow-lg transition-shadow duration-300">
                        <h4 className="font-bold text-gray-800">{dayOfWeek}</h4>
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
  
  return (
    <>
      {/* This style tag injects custom animations for the background */}
      <style>{`
        @keyframes background-pan {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-background-pan {
          background-size: 200% 200%;
          animation: background-pan 15s ease infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-in-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-in-out forwards;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-100 font-sans text-slate-800 antialiased animate-background-pan">
        <div className="container mx-auto p-4 sm:p-8 max-w-7xl">
          <header className="text-center my-12 md:my-16 animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
              Unlock Your <span className="text-indigo-600">English Potential</span>
            </h1>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              Choose a plan that fits your goals and schedule your classes with our expert tutors today.
            </p>
          </header>

          <main>
            {/* STEP 1: Plan Selection */}
            {currentStep === 'plan' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
                {Object.values(coursePlans).map(plan => (
                  <div key={plan.id} className="bg-white rounded-2xl shadow-lg p-8 flex flex-col transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl relative border-2 border-transparent hover:border-indigo-500/50">
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

            {/* STEP 2: Schedule Selection */}
            {currentStep === 'schedule' && selectedPlan && (
              <div className="bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
                    <div>
                        <h3 className="text-3xl font-bold text-slate-800">Schedule Your Classes</h3>
                        <p className="text-slate-500 mt-1">You've selected the <strong>{selectedPlan.name}</strong>. Please book {selectedPlan.totalClasses} session(s).</p>
                    </div>
                    <div className="mt-4 md:mt-0 text-lg font-semibold bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg">
                        Selected: {selectedDates.length} / {selectedPlan.totalClasses}
                    </div>
                </div>
                
                {isLoading && <LoadingSpinner />}
                {error && <p className="text-red-500 text-center py-4 font-semibold">{error}</p>}
                {!isLoading && !error && renderDateGrid()}

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
            
            {/* STEP 3: Checkout and Account Creation */}
            {currentStep === 'checkout' && paymentSummary && (
                <div className="bg-white max-w-2xl mx-auto p-8 rounded-3xl shadow-2xl border animate-fade-in-up">
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
                        <form onSubmit={handleCreateAccount} className="space-y-6 animate-fade-in">
                            <h3 className="text-2xl font-bold text-center text-slate-800 -mt-2 mb-6">Create Your Student Account</h3>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Jane Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    value={userEmail}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                    className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    value={userPassword}
                                    onChange={(e) => setUserPassword(e.target.value)}
                                    className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row-reverse items-center gap-4 pt-4">
                                <button type="submit" className="w-full sm:w-auto flex items-center justify-center bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                                    Create Account & Continue
                                </button>
                                <button type="button" onClick={() => setCurrentStep('schedule')} className="w-full sm:w-auto text-slate-600 font-semibold py-3 px-6 rounded-lg hover:bg-slate-100 transition-colors">
                                    Back to Schedule
                                </button>
                            </div>
                        </form>
                    ) : (
                         <form onSubmit={handleLogin} className="space-y-6 animate-fade-in">
                             <h3 className="text-2xl font-bold text-center text-slate-800 -mt-2 mb-6">Welcome Back!</h3>
                            <div>
                                <label htmlFor="login-email" className="block text-sm font-medium text-slate-700">Email Address</label>
                                <input 
                                    type="email" 
                                    id="login-email" 
                                    value={userEmail}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                    className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center">
                                    <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">Password</label>
                                    <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500">Forgot password?</a>
                                </div>
                                <input 
                                    type="password" 
                                    id="login-password" 
                                    value={userPassword}
                                    onChange={(e) => setUserPassword(e.target.value)}
                                    className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row-reverse items-center gap-4 pt-4">
                                <button type="submit" className="w-full sm:w-auto flex items-center justify-center bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                                    Login & Continue
                                </button>
                                <button type="button" onClick={() => setCurrentStep('schedule')} className="w-full sm:w-auto text-slate-600 font-semibold py-3 px-6 rounded-lg hover:bg-slate-100 transition-colors">
                                    Back to Schedule
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* STEP 4: Payment Summary */}
            {currentStep === 'payment' && paymentSummary && (
                <div className="bg-white max-w-2xl mx-auto p-8 rounded-3xl shadow-2xl border animate-fade-in-up">
                  <h3 className="text-3xl font-bold text-center text-slate-800 mb-2">Booking Summary</h3>
                  <p className="text-center text-slate-500 mb-6">Confirm your class schedule and proceed with the booking.</p>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
                      <div className="flex justify-between items-center mb-4">
                          <p className="text-slate-600">Plan</p>
                          <p className="font-bold text-slate-800">{paymentSummary.plan.name}</p>
                      </div>
                    <div className="flex justify-between items-center mb-4">
                          <p className="text-slate-600">Student Name</p>
                          <p className="font-bold text-slate-800">{userName}</p>
                      </div>
                      <div className="flex justify-between items-center">
                          <p className="text-slate-600">Student Email</p>
                          <p className="font-bold text-slate-800">{userEmail}</p>
                      </div>
                  </div>

                  <div>
                      <h4 className="font-semibold text-slate-700 mb-3">Selected Classes:</h4>
                      <ul className="space-y-3">
                          {paymentSummary.classes.map((c, i) => (
                              <li key={i} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                                  <div className="flex items-center">
                                    <Icon path="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" className="w-5 h-5 text-indigo-500 mr-3"/>
                                    <span>{new Date(c.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>
                                  </div>
                                  <span className="font-semibold text-slate-800">{c.time}</span>
                              </li>
                          ))}
                      </ul>
                  </div>

                  <div className="border-t my-6"></div>

                  <div className="flex justify-between items-center text-xl">
                      <span className="font-bold text-slate-800">Total to Pay:</span>
                      <span className="text-3xl font-extrabold text-green-600">
                        ${paymentSummary.totalCost} MXN
                      </span>
                  </div>

                  <div className="flex flex-col sm:flex-row-reverse justify-center items-center gap-4 mt-8">
                    <button onClick={handleConfirmBooking} disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:bg-indigo-400 disabled:cursor-not-allowed transform hover:scale-105">
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                      ) : (
                        'Confirm & Book Classes'
                      )}
                    </button>
                    <button type="button" onClick={() => setCurrentStep('checkout')} className="w-full sm:w-auto text-slate-600 font-semibold py-3 px-6 rounded-lg hover:bg-slate-100 transition-colors">
                      Back to Checkout
                    </button>
                  </div>
                </div>
            )}

          </main>
        </div>
        <Notification {...notification} />
      </div>
    </>
  );
};

export default App;

