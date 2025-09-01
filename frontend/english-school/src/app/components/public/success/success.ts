import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { Storage } from '../../../services/storage'; // reuse the SSR-safe storage service

export interface Plan {
  title: string;
  sessions: number;
  cost: number;         // per-class cost
  description: string;
  features: string[];
}

export interface TimeSlot {
  date: string | Date;
  time: string;         // HH:mm
}
@Component({
  selector: 'app-success',
  imports: [DatePipe, CurrencyPipe, CommonModule],
  templateUrl: './success.html',
  styleUrl: './success.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Success implements OnInit {
  private router = inject(Router);
  private storage = inject(Storage);
  private platformId = inject(PLATFORM_ID);

  // state
  plan = signal<Plan | null>(null);
  slots = signal<TimeSlot[]>([]);
  orderId = signal<string>('');
  paidAt = signal<Date>(new Date());

  // derived
  totalClasses = computed(() => this.slots().length);
  pricePerClass = computed(() => this.plan()?.cost ?? 0);
  totalCost = computed(() => this.totalClasses() * this.pricePerClass());

  ngOnInit(): void {
    // 1) from router state
    const nav = this.router.getCurrentNavigation();
    const state = (nav?.extras?.state ?? {}) as { plan?: Plan; slots?: TimeSlot[]; orderId?: string; paidAt?: string | Date };

    if (state.plan) this.plan.set(state.plan);
    if (state.slots?.length) this.slots.set(state.slots.map(s => ({ ...s, date: new Date(s.date) })));
    if (state.orderId) this.orderId.set(state.orderId);
    if (state.paidAt) this.paidAt.set(new Date(state.paidAt));

    // 2) fallback to SSR-safe storage
    if (!this.plan()) {
      const savedPlan = this.storage.getItem('selectedPlan');
      if (savedPlan) this.plan.set(JSON.parse(savedPlan));
    }
    if (this.slots().length === 0) {
      const savedSlots = this.storage.getItem('selectedSlots');
      if (savedSlots) {
        const parsed: TimeSlot[] = JSON.parse(savedSlots);
        this.slots.set(parsed.map(s => ({ ...s, date: new Date(s.date) })));
      }
    }

    // 3) ensure order id
    if (!this.orderId()) this.orderId.set(this.generateOrderId());

    // Optional: once shown, clear transient checkout state
    this.storage.removeItem('selectedPlan');
    this.storage.removeItem('selectedSlots');
  }

  private generateOrderId(): string {
    // SSR-safe (no window.crypto guaranteed)
    const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
    const stamp = Date.now().toString().slice(-6);
    return `EF-${stamp}-${rnd}`;
    // example: EF-456789-AB12CD
  }

  printReceipt(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.print();
    }
  }

  goToDashboard(): void {
    const toPrivate = this.router.url.includes('/private');
    this.router.navigate([toPrivate ? 'private/dashboard' : 'private/dashboard']);
  }

  goToBookings(): void {
    const toPrivate = this.router.url.includes('/private');
    this.router.navigate([toPrivate ? 'private/bookings' : 'public/schedule']);
  }
}