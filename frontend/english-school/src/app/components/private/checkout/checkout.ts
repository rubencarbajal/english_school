import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Storage } from '../../../services/storage'; // adjust path

// Keep types in sync with your app
export interface Plan {
  title: string;
  sessions: number;
  cost: number;         // cost per class
  description: string;
  features: string[];
}

export interface TimeSlot {
  date: string | Date;  // allow string (when restored from storage)
  time: string;         // e.g. "10:00"
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, CurrencyPipe],
  templateUrl: './checkout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './checkout.scss'

})
export class Checkout implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private storage = inject(Storage);

  plan = signal<Plan | null>(null);
  slots = signal<TimeSlot[]>([]);

  // derived totals
  totalClasses = computed(() => this.slots().length);
  pricePerClass = computed(() => this.plan()?.cost ?? 0);
  totalCost = computed(() => this.totalClasses() * this.pricePerClass());

  // Simulate loading/payment
  paying = signal(false);
  payError = signal<string | null>(null);
  paySuccess = signal(false);

  // Prefilled fake card data (autocomplete-friendly)
  paymentForm = this.fb.group({
    name: ['John Demo', [Validators.required, Validators.minLength(2)]],
    cardNumber: ['4242424242424242', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    expiry: ['12/29', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['123', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    saveCard: [true],
  });

  ngOnInit(): void {
    console.log('Checkout init');
    // 1) Try router state
    const nav = this.router.getCurrentNavigation();
    const state = (nav?.extras?.state ?? {}) as { plan?: Plan; slots?: TimeSlot[] };
    if (state.plan) this.plan.set(state.plan);
    if (state.slots?.length) this.slots.set(state.slots.map(s => ({ ...s, date: new Date(s.date) })));

    // 2) Fallback to storage (SSR-safe wrapper)
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
  }
  // helper (put it near other privates)
  private perPlanSlotsKey() {
    const p = this.plan();
    return p ? `selectedSlots:${p.title}` : null;
  }

  // replace your pay() with this:
  async pay() {
    this.payError.set(null);
    this.paySuccess.set(false);

    if (!this.plan() || this.slots().length === 0) {
      this.payError.set('Missing plan or selected sessions.');
      return;
    }
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.paying.set(true);
    try {
      // Simulate processing delay
      await new Promise(res => setTimeout(res, 1000));

      // Simulate success
      this.paySuccess.set(true);

      // 🔑 Clear ALL selection state
      const perPlanKey = this.perPlanSlotsKey();
      if (perPlanKey) this.storage.removeItem(perPlanKey); // <- remove per-plan cache
      this.storage.removeItem('selectedPlan');
      this.storage.removeItem('selectedSlots');
      this.storage.removeItem('postLoginRedirect');

      // Route based on current area (private/public)
      const toPrivate = this.router.url.includes('/private');
      this.router.navigate([toPrivate ? 'private/success' : 'public/success']);
    } catch (e: any) {
      this.payError.set(e?.message ?? 'Payment failed. Please try again.');
    } finally {
      this.paying.set(false);
    }
  }


  // Utility for manual edit/cancel if you want to go back to scheduling
  backToSchedule() {
    const toPrivate = this.router.url.includes('/private');
    this.router.navigate([toPrivate ? 'private/schedule' : 'public/schedule']);
  }
}
