import React from 'react';

/**
 * A notification component that appears at the bottom of the screen.
 * It can be used to show success or error messages.
 * @param {object} props - The component props.
 * @param {string} props.message - The message to display.
 * @param {boolean} props.show - Whether the notification is visible.
 * @param {('success'|'error')} [props.type='error'] - The type of notification.
 */
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

export default Notification;
