import React from 'react';
import { useBooking } from '../../hooks/useBooking';
import { useUI } from '../../hooks/useUI';
import LoadingSpinner from '../shared/LoadingSpinner';

/**
 * Renders the calendar grid for users to select their class dates and times.
 */
const SchedulePicker = () => {
    // Get state and functions from contexts
    const { 
        selectedPlan, 
        selectedDates, 
        classAvailability, 
        handleClassSelection, 
        handleProceedToCheckout, 
        setCurrentStep 
    } = useBooking();
    const { isLoading } = useUI();

    // Renders the grid of available dates and time slots
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

    if (!selectedPlan) return null;

    return (
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
    );
};

export default SchedulePicker;
