import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Plan } from '../schedule-classes/schedule-classes';

@Component({
  selector: 'app-plan-selection',
  imports: [NgClass],
  templateUrl: './plan-selection.html',
  styleUrl: './plan-selection.scss'
})
export class PlanSelection {
  plans = [{
    cost: 150,
    sessions: 1,
    title: 'Trial Class',
    description: 'A single trial class to experience our method.',
    features: [
      '45-minute live session',
      'Personalized feedback'
    ],
    tag: null,
    tagColor: ''
  }, {
    cost: 100,
    sessions: 5,
    title: 'Starter Pack',
    description: 'Perfect for getting comfortable and seeing progress.',
    features: [
      '5 live sessions',
      'Progress tracking',
      'Flexible scheduling',
      'Access to practice materials'
    ],
    tag: 'Most Popular',
    tagColor: 'bg-sky-500'
  },
  {
    cost: 90,
    sessions: 10,
    title: 'Immersion Pack',
    description: 'The complete package for serious, rapid improvement.',
    features: [
      '10 live sessions',
      'Dedicated support',
      'Priority scheduling',
      'Changes to scheduling',
      'Class re schedule',
      'All practice materials'
    ],
    tag: 'Best Value',
    tagColor: 'bg-emerald-500'
  }];

constructor(private router: Router) {}

 private platformId = inject(PLATFORM_ID);
  choose(plan: Plan) {
    const isBrowser = isPlatformBrowser(this.platformId);

    if(isBrowser){
  // Optional: persist in sessionStorage to survive refreshes
    sessionStorage.setItem('selectedPlan', JSON.stringify(plan));

    }
  
    // Navigate passing router state
    this.router.navigate(['public/schedule'], { state: { plan } });
  }
}