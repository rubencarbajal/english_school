import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, signal, computed, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, DatePipe, isPlatformBrowser, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { Storage } from '../../../services/storage'; // adjust path
// Define a simple type for the plan object for better type safety.
export interface Plan {
  title: string;
  sessions: number;
  cost: number;
  description: string;
  features: string[];
}

// Define a type for a selected time slot.
export interface TimeSlot {
  date: Date;
  time: string;
}

@Component({
  selector: 'app-schedule-classes',
  imports: [NgClass, DatePipe, CommonModule],
  templateUrl: './schedule-classes.html',
  styleUrl: './schedule-classes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class ScheduleClasses implements OnInit {
  // --- INPUTS & OUTPUTS ---
  @Input() plan: Plan | null = null;
  @Output() goBack = new EventEmitter<void>();
  @Output() proceed = new EventEmitter<TimeSlot[]>();

  // --- STATE MANAGEMENT ---
  selectedSlots = signal<TimeSlot[]>([]);
  calendarDays = signal<{ date: Date, availableTimes: string[] }[]>([]);

  // --- COMPUTED VALUES ---
  remainingSessions = computed(() => {
    if (!this.plan) return 0;
    return this.plan.sessions - this.selectedSlots().length;
  });

constructor(private router: Router, private storage: Storage) {}

  private platformId = inject(PLATFORM_ID);

  // --- LIFECYCLE HOOKS ---
  ngOnInit() {
    // 1) If plan wasn’t provided via @Input (e.g., routed directly),
    // try to recover from router state:
    // if (!this.plan) {
    //   const s = history.state as { plan?: Plan };
    //   if (s?.plan) this.plan = s.plan;
    // }

    const isBrowser = isPlatformBrowser(this.platformId);
    // 2) If still nothing (hard refresh), recover from sessionStorage:
    if (!this.plan) {

      if (isBrowser) {
        const saved = sessionStorage.getItem('selectedPlan');
        if (saved) this.plan = JSON.parse(saved);
      }
    }

    // 3) If we finally have a plan, go ahead and prepare the calendar
    this.generateCalendarData();
  }

  // --- PUBLIC METHODS ---
  isSlotSelected(date: Date, time: string): boolean {
    return this.selectedSlots().some(slot =>
      slot.date.getTime() === date.getTime() && slot.time === time
    );
  }

  toggleSlot(date: Date, time: string): void {
    const existingSlotIndex = this.selectedSlots().findIndex(slot =>
      slot.date.getTime() === date.getTime() && slot.time === time
    );

    if (existingSlotIndex > -1) {
      // Slot is already selected, so unselect it
      this.selectedSlots.update(slots => slots.filter((_, index) => index !== existingSlotIndex));
    } else {
      // Slot is not selected, add it if there are remaining sessions
      if (this.remainingSessions() > 0) {
        this.selectedSlots.update(slots => [...slots, { date, time }]);
      }
    }
  }

  // --- PRIVATE HELPERS ---
  private generateCalendarData(): void {
    const days = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      days.push({
        date: futureDate,
        availableTimes: this.getAvailabilityForDay(futureDate)
      });
    }
    this.calendarDays.set(days);
  }

  private getAvailabilityForDay(date: Date): string[] {
    const dayOfWeek = date.getDay();
    const dateOfMonth = date.getDate();
    // Simple hashing to get a consistent (but pseudo-random) set of slots for a given day
    const seed = dayOfWeek * 10 + dateOfMonth;
    const morningHours = ['09:00', '10:00', '11:00', '12:00'];
    const afternoonHours = ['16:00', '17:00', '20:00', '21:00'];

    let available: string[] = [];
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // No classes on Saturday/Sunday
      if (seed % 3 === 0) available.push(...morningHours.slice(0, 2), ...afternoonHours.slice(2, 4));
      else if (seed % 3 === 1) available.push(...morningHours.slice(1, 4), ...afternoonHours.slice(0, 1));
      else available.push(...morningHours, ...afternoonHours);
    }
    // Filter some out to make it look more realistic
    return available.filter((_, i) => (seed + i) % 2 === 0);
  }

  goToCheckout(slots: TimeSlot[]) {
  const plan = this.plan!;
  // persist for refresh
  this.storage.setItem('selectedPlan', JSON.stringify(plan));
  this.storage.setItem('selectedSlots', JSON.stringify(slots));
  // navigate keeping the current area (public/private)
  const toPrivate = this.router.url.includes('/private');
  this.router.navigate([toPrivate ? 'private/checkout' : 'private/checkout'], {
    state: { plan, slots }
  });
}
}
