import { Routes } from '@angular/router';
import { Layout } from './components/public/layout/layout';
import { PlanSelection } from './components/public/plan-selection/plan-selection';
import { ScheduleClasses } from './components/public/schedule-classes/schedule-classes';
import { Dashboard } from './components/private/dashboard/dashboard';
import { Login } from './components/public/auth/login/login';
import { ForgotPassword } from './components/public/auth/forgot-password/forgot-password';
import { ResetPassword } from './components/public/auth/reset-password/reset-password';
import { Checkout } from './components/private/checkout/checkout';
import { Success } from './components/public/success/success';
import { Home } from './components/private/home/home';
import { Home as publicHome } from './components/public/home/home';
import { privateGuard } from './guards/private-guard';

export const routes: Routes = [
    {
        path: 'public', component: Layout, children: [
            // {path: '/booked-classes', component: BoockedClasses},
            { path: 'plan', component: PlanSelection },
            { path: 'schedule', component: ScheduleClasses },
            { path: 'login', component: Login },
            { path: 'forgot-password', component: ForgotPassword },
            // /reset-password/:token
            { path: 'reset-password/:token', component: ResetPassword },
            // or /reset-password?token=XYZ
            { path: 'reset-password', component: ResetPassword },
            { path: 'home', component: publicHome },
        ]
    },
    {
        canActivate: [privateGuard],
        path: 'private', component: Dashboard, children: [
            { path: 'plan', component: PlanSelection },
            { path: 'schedule', component: ScheduleClasses },
            { path: 'checkout', component: Checkout },
            { path: 'success', component: Success },
            { path: 'home', component: Home },
        ]
    },
    { path: '', pathMatch: 'full', redirectTo: 'public/home' },
    { path: '**', pathMatch: 'full', redirectTo: 'public/home' },
];
