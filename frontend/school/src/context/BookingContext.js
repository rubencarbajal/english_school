import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useUI } from './UIContext';
import { useAuth } from './AuthContext';

// --- Configuration ---
const BACKEND_URL = 'http://localhost:3000';

// Create a context for managing the state of the class booking flow.
const BookingContext = createContext();

// Export a custom hook for easy consumption.
export const useBooking = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
    const { setIsLoading, showAppNotification } = useUI();
    const { token } = useAuth();

    // State for the multi-step booking process
    const [currentStep, setCurrentStep] = useState('plan'); // 'plan', 'schedule', 'checkout', 'payment'
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedDates, setSelectedDates] = useState([]);
    const [paymentSummary, setPaymentSummary] = useState(null);
    const [classAvailability, setClassAvailability] = useState({});

    /**
     * Resets the entire booking flow to its initial state.
     */
    const resetBooking = () => {
        setCurrentStep('plan');
        setSelectedPlan(null);
        setSelectedDates([]);
        setPaymentSummary(null);
    };

    const fetchAvailability = useCallback(async () => {
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
    }, [setIsLoading, showAppNotification]);

    // Fetch availability whenever the user navigates to the scheduling step.
    useEffect(() => {
        if (currentStep === 'schedule') {
            fetchAvailability();
        }
    }, [currentStep, fetchAvailability]);

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
        setSelectedDates([]);
        setCurrentStep('schedule');
    };

    const handleClassSelection = (date, time) => {
        const isAlreadySelected = selectedDates.some(d => d.date === date && d.time === time);

        if (isAlreadySelected) {
            setSelectedDates(currentDates => currentDates.filter(d => d.date !== date || d.time !== time));
        } else {
            if ((classAvailability[date]?.[time] || 0) <= 0) {
                showAppNotification('This time slot is already booked.');
                return;
            }
            if (selectedDates.length >= selectedPlan.totalClasses) {
                showAppNotification(`You can only select ${selectedPlan.totalClasses} class(es) for the ${selectedPlan.name}.`);
                return;
            }
            setSelectedDates(currentDates => [...currentDates, { date, time }]);
        }
    };

    /**
     * Validates selections and creates a payment summary object.
     */
    const generatePaymentSummary = () => {
        if (!selectedPlan || selectedDates.length !== selectedPlan.totalClasses) {
            showAppNotification(`Please select exactly ${selectedPlan.totalClasses} class(es).`);
            return null;
        }
        const totalCost = selectedDates.length * selectedPlan.pricePerClass;
        const summary = { plan: selectedPlan, classes: selectedDates, totalCost };
        setPaymentSummary(summary);
        return summary;
    };

    /**
     * Submits the final booking to the backend.
     */
    const confirmBooking = async () => {
        if (!paymentSummary) {
            showAppNotification('No payment summary available to confirm.');
            return;
        }
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
                resetBooking();
            }, 3500);

        } catch (err) {
            showAppNotification(err.message || 'Booking failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const value = {
        currentStep,
        setCurrentStep,
        selectedPlan,
        handleSelectPlan,
        selectedDates,
        handleClassSelection,
        paymentSummary,
        generatePaymentSummary,
        classAvailability,
        confirmBooking,
        resetBooking,
    };

    return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};
