import React from 'react';

/**
 * A simple footer component that displays copyright information.
 */
const Footer = () => {
    return (
        <footer className="text-center mt-24 py-8 border-t border-slate-200 text-slate-500">
            <p>&copy; {new Date().getFullYear()} Fluent English. All rights reserved.</p>
            <p className="text-sm mt-2">Built with passion for learners worldwide.</p>
        </footer>
    );
};

export default Footer;
