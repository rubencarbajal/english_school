import React from 'react';
import { useBooking } from '../../hooks/useBooking';
import { coursePlans } from '../../constants/coursePlans';
import Icon from '../shared/Icon';

/**
 * Displays the available course plans for the user to choose from.
 */
const PlanSelector = () => {
    const { handleSelectPlan } = useBooking();

    return (
        <section>
            <div className="text-center animate-fade-in-up mb-12">
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Step 1: Choose Your Perfect Plan</h2>
                <p className="mt-2 text-lg text-slate-600 max-w-2xl mx-auto">We offer flexible packages to match your learning pace and budget.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
                {Object.values(coursePlans).map(plan => (
                    <div key={plan.id} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-8 flex flex-col transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl relative border-2 border-transparent hover:border-indigo-500/50">
                        {plan.badge && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">{plan.badge}</div>}
                        <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
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
        </section>
    );
};

export default PlanSelector;
