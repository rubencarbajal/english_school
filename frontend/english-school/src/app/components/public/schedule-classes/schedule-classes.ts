import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  OnInit,
  inject,
  PLATFORM_ID,
  effect,
} from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { Storage } from '../../../services/storage'; // SSR-safe wrapper (getItem/setItem/removeItem)
import { Auth } from '../../../services/auth';       // Auth service with isLoggedIn()

// ---- Types ----
export interface Plan {
  title: string;
  sessions: number; // how many classes can be selected
  cost: number;     // price per class
  description: string;
  features: string[];
}

export interface TimeSlot {
  date: Date;       // LOCAL date (no time significance)
  time: string;     // "HH:mm"
}

@Component({
  selector: 'app-schedule-classes',
  standalone: true,
  imports: [NgClass, DatePipe, CommonModule],
  templateUrl: './schedule-classes.html',
  styleUrl: './schedule-classes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleClasses implements OnInit {
  // --- INPUT (signal-backed) & OUTPUTS ---
  private _plan = signal<Plan | null>(null);
  @Input() set plan(value: Plan | null) { this._plan.set(value); }
  get plan(): Plan | null { return this._plan(); }

  @Output() goBack = new EventEmitter<void>();
  @Output() proceed = new EventEmitter<TimeSlot[]>();

  // --- STATE ---
  selectedSlots = signal<TimeSlot[]>([]);
  calendarDays = signal<{ date: Date; availableTimes: string[] }[]>([]);

  // --- DI ---
  private router = inject(Router);
  private storage = inject(Storage);
  private auth = inject(Auth);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private platformId = inject(PLATFORM_ID);

  // --- COMPUTED (reactive to plan & selections) ---
  remainingSessions = computed(() => {
    const p = this._plan();
    if (!p) return 0;
    return Math.max(0, p.sessions - this.selectedSlots().length);
  });

  // --- EFFECT: persist selection per-plan whenever it changes ---
  // We store LOCAL date-only keys to avoid timezone drift on reload.
  private persistSelection = effect(() => {
    const p = this._plan();
    if (!p) return; // wait until plan is known
    const payload = this.selectedSlots().map(s => ({
      dateKey: this.toDateKey(s.date), // <-- store YYYY-MM-DD (local)
      time: s.time,
    }));
    this.storage.setItem(this.getSlotsKey(), JSON.stringify(payload));
  });

  // --- INIT ---
  ngOnInit(): void {
    // 1) Prefer router state (works during navigation)
    const nav = this.router.getCurrentNavigation();
    const state = (nav?.extras?.state ?? {}) as { plan?: Plan };
    if (!this.plan && state?.plan) this._plan.set(state.plan);

    // 2) Fallback to persisted plan (SSR-safe via Storage wrapper)
    if (!this.plan) {
      const savedPlan = this.storage.getItem('selectedPlan');
      if (savedPlan) {
        try { this._plan.set(JSON.parse(savedPlan) as Plan); } catch { /* ignore */ }
      }
    }

    // 3) If we have a plan, persist it so a refresh keeps context
    if (this.plan) {
      this.storage.setItem('selectedPlan', JSON.stringify(this.plan));
    }

    // 4) Restore any partially selected slots for this plan (per-plan key, LOCAL dateKey)
    const savedSlots = this.storage.getItem(this.getSlotsKey());
    if (savedSlots) {
      try {
        const parsed: Array<{ dateKey: string; time: string }> = JSON.parse(savedSlots);
        const normalized = parsed.map(s => ({ date: this.fromDateKey(s.dateKey), time: s.time }));
        this.selectedSlots.set(this.plan ? normalized.slice(0, this.plan.sessions) : normalized);
      } catch { /* ignore */ }
    }

    // 5) Build calendar UI
    this.generateCalendarData();
  }

  // --- HELPERS (date-only comparison to avoid timezone issues) ---
  private getSlotsKey(): string {
    return `selectedSlots:${this.plan?.title ?? 'default'}`;
  }

  private toDateKey(d: Date): string {
    // Local Y-M-D key, zero-padded
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private fromDateKey(key: string): Date {
    // Construct LOCAL midnight date
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  }

  private sameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  }

  isSlotSelected(date: Date, time: string): boolean {
    // Compare by local day, not ms-since-epoch
    return this.selectedSlots().some(
      s => s.time === time && this.sameDay(s.date, date)
    );
  }

  toggleSlot(date: Date, time: string): void {
    // If already selected -> unselect
    const i = this.selectedSlots().findIndex(
      s => s.time === time && this.sameDay(s.date, date)
    );
    if (i > -1) {
      this.selectedSlots.update(arr => arr.filter((_, idx) => idx !== i));
      return;
    }

    // Not selected -> add if we still have remaining sessions
    if (this.remainingSessions() > 0) {
      this.selectedSlots.update(arr => [...arr, { date, time }]);
    }
  }

  clearSelection(): void {
    this.selectedSlots.set([]);
    this.storage.removeItem(this.getSlotsKey());
  }

  // --- NAVIGATION ---
  goToCheckout(slots: TimeSlot[] = this.selectedSlots()): void {
    const plan = this.plan;
    if (!plan) return;

    // Persist for refresh / cross-page recovery
    this.storage.setItem('selectedPlan', JSON.stringify(plan));
    // For cross-page use, keep ISO if your checkout expects it.
    this.storage.setItem(
      'selectedSlots',
      JSON.stringify(slots.map(s => ({ ...s, date: s.date.toISOString() })))
    );

    if (this.auth.isLoggedIn()) {
      // Logged in → go to private checkout
      this.router.navigate(['private/checkout'], { state: { plan, slots } });
    } else {
      // Not logged → remember intent and send to auth
      this.storage.setItem('postLoginRedirect', 'private/checkout');
      this.router.navigate(['public/login'], { state: { mode: 'login' } });
    }
  }

  // Emit upward if parent flow needs it
  proceedToParent(): void {
    this.proceed.emit(this.selectedSlots());
  }

  // --- CALENDAR DATA ---
  private generateCalendarData(): void {
    const days: { date: Date; availableTimes: string[] }[] = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const futureDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i); // local midnight
      days.push({
        date: futureDate,
        availableTimes: this.getAvailabilityForDay(futureDate),
      });
    }
    this.calendarDays.set(days);
  }

  private getAvailabilityForDay(date: Date): string[] {
    const dayOfWeek = date.getDay();
    const dateOfMonth = date.getDate();

    // Deterministic pseudo-random availability
    const seed = dayOfWeek * 10 + dateOfMonth;
    const morning = ['09:00', '10:00', '11:00', '12:00'];
    const afternoon = ['16:00', '17:00', '20:00', '21:00'];

    let available: string[] = [];
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      if (seed % 3 === 0) available.push(...morning.slice(0, 2), ...afternoon.slice(2, 4));
      else if (seed % 3 === 1) available.push(...morning.slice(1, 4), ...afternoon.slice(0, 1));
      else available.push(...morning, ...afternoon);
    }

    // Filter to make it look more realistic
    return available.filter((_, i) => ((seed + i) % 2) === 0);
  }
}
