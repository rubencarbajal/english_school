import { Routes } from '@angular/router';
import { Layout } from './components/public/layout/layout';
import { PlanSelection } from './components/public/plan-selection/plan-selection';
import { ScheduleClasses } from './components/public/schedule-classes/schedule-classes';

export const routes: Routes = [
    {
        path: 'public', component: Layout, children: [
            // {path: '/booked-classes', component: BoockedClasses},
            { path: 'plan', component: PlanSelection },
            { path: 'schedule', component: ScheduleClasses },
        ]
    }
];
