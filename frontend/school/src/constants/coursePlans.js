// --- Static Data: Course Plans ---
// This file exports the pricing and feature details for each available course plan.
// This makes it easy to update plans without touching component logic.

export const coursePlans = {
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
