import { Injectable } from '@angular/core';

export interface Plan {
  id: string;
  title: string;
  sessions: number;   // package size purchased
  cost: number;       // price per class
  description?: string;
  features?: string[];
}

export interface TimeSlot {
  date: string | Date; // ISO or Date
  time: string;        // "HH:mm"
  status: 'upcoming' | 'completed' | 'missed';
}

export interface PlanPurchase {
  purchaseId: string;
  plan: Plan;
  purchasedSessions: number;       // how many classes were paid in this purchase
  pricePerClass: number;           // redundancy for easy math/reporting
  purchasedAt: string | Date;
  upcomingSessions: TimeSlot[];
  completedSessions: TimeSlot[];
  // optionally: missedSessions?: TimeSlot[];
}

@Injectable({ providedIn: 'root' })
export class Bookings {
  // Replace this with HTTP calls to your backend
  getPurchases(): PlanPurchase[] {
    return [
      {
        purchaseId: 'ORD-20250815-AB12',
        plan: { id: 'starter', title: 'Starter', sessions: 4, cost: 12 },
        purchasedSessions: 4,
        pricePerClass: 12,
        purchasedAt: '2025-08-15T10:11:00Z',
        upcomingSessions: [
          { date: '2025-09-02', time: '10:00', status: 'upcoming' },
          { date: '2025-09-05', time: '20:00', status: 'upcoming' },
        ],
        completedSessions: [
          { date: '2025-08-20', time: '11:00', status: 'completed' },
        ],
      },
      {
        purchaseId: 'ORD-20250728-CD34',
        plan: { id: 'pro', title: 'Pro', sessions: 16, cost: 9 },
        purchasedSessions: 8,   // e.g. partial bundle or promo
        pricePerClass: 9,
        purchasedAt: '2025-07-28T08:05:00Z',
        upcomingSessions: [
          { date: '2025-09-03', time: '09:00', status: 'upcoming' },
        ],
        completedSessions: [
          { date: '2025-08-01', time: '16:00', status: 'completed' },
          { date: '2025-08-08', time: '16:00', status: 'completed' },
          { date: '2025-08-15', time: '16:00', status: 'completed' },
        ],
      }
    ];
  }
}
