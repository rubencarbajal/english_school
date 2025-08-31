import React from 'react';
import { testimonials } from '../../constants/testimonials';

/**
 * A section that displays student testimonials.
 */
const Testimonials = () => {
    return (
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
    );
};

export default Testimonials;
