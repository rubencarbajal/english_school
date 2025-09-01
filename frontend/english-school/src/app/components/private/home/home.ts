import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Bookings, PlanPurchase } from '../../../services/booking'; // adjust path

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, DatePipe, CurrencyPipe],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  private svc = inject(Bookings);
  private router = inject(Router);

  purchases = signal<PlanPurchase[]>([]);

  ngOnInit(): void {
    // In a real app, this could be an HTTP call with signals/observables
    this.purchases.set(this.svc.getPurchases());
  }

  // ---- Derived totals (across all purchases) ----
  totalPurchased = computed(() =>
    this.purchases().reduce((sum, p) => sum + p.purchasedSessions, 0)
  );

  totalCompleted = computed(() =>
    this.purchases().reduce((sum, p) => sum + p.completedSessions.length, 0)
  );

  totalScheduled = computed(() =>
    this.purchases().reduce((sum, p) => sum + p.upcomingSessions.length, 0)
  );

  totalRemainingToSchedule = computed(() =>
    Math.max(0, this.totalPurchased() - this.totalCompleted() - this.totalScheduled())
  );

  totalCost = computed(() =>
    this.purchases().reduce((sum, p) => sum + p.purchasedSessions * p.pricePerClass, 0)
  );

  // ---- Per-purchase helpers ----
  completedCount(p: PlanPurchase) { return p.completedSessions.length; }
  scheduledCount(p: PlanPurchase) { return p.upcomingSessions.length; }
  remainingToSchedule(p: PlanPurchase) {
    return Math.max(0, p.purchasedSessions - this.completedCount(p) - this.scheduledCount(p));
  }
  progressPct(p: PlanPurchase) {
    const done = this.completedCount(p);
    return Math.min(100, Math.round((done / Math.max(1, p.purchasedSessions)) * 100));
  }
  planTotalCost(p: PlanPurchase) {
    return p.purchasedSessions * p.pricePerClass;
  }

  scheduleFor(p: PlanPurchase) {
    const toPrivate = this.router.url.includes('/private');
    this.router.navigate([toPrivate ? 'private/schedule' : 'public/schedule'], {
      state: { plan: p.plan }
    });
  }

  buyMore() {
    const toPrivate = this.router.url.includes('/private');
    this.router.navigate([toPrivate ? 'private/plans' : 'public/plans']);
  }

  viewAllBookings() {
    const toPrivate = this.router.url.includes('/private');
    this.router.navigate([toPrivate ? 'private/bookings' : 'public/bookings']);
  }
}