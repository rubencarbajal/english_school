import React from 'react';
import { useBooking } from '../../hooks/useBooking';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../hooks/useUI';
import Icon from '../shared/Icon';

/**
 * Displays the final summary of the booking before confirmation.
 * It shows user details, selected classes, and total cost.
 */
const CheckoutSummary = () => {
    // Get state and functions from contexts
    const { paymentSummary, handleConfirmBooking, setCurrentStep } = useBooking();
    const { user } = useAuth();
    const { isLoading } = useUI();

    // Don't render if there's no payment summary or user
    if (!paymentSummary || !user) {
        return null;
    }

    return (
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
    );
};

export default CheckoutSummary;
