import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// NEW: bring in your SSR-safe storage + auth services (adjust paths if needed)
import { Storage } from '../../../../services/storage';
import { Auth } from '../../../../services/auth';

type Mode = 'login' | 'register';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterLink, NgClass],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // NEW DI
  private storage = inject(Storage);
  private auth = inject(Auth);

  // UI state
  mode = signal<Mode>('login');
  loading = signal(false);
  authError = signal<string | null>(null);
  showLoginPassword = signal(false);
  showRegPassword = signal(false);
  showRegPassword2 = signal(false);

  // Forms
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [true],
  });

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    confirmEmail: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    acceptTerms: [false, [Validators.requiredTrue]],
  }, { validators: [matchEmailsValidator, matchPasswordsValidator] });

  // Helpers
  get lf() { return this.loginForm.controls; }
  get rf() { return this.registerForm.controls; }

  isLogin = computed(() => this.mode() === 'login');

  switchTo(mode: Mode) {
    this.mode.set(mode);
    this.authError.set(null);
  }

  // ===== NEW: central post-auth navigation logic =====
  private getStoredPlanAndSlots(): { plan: any | null; slots: { date: Date; time: string }[] } {
    const planJson = this.storage.getItem('selectedPlan');
    const slotsJson = this.storage.getItem('selectedSlots');

    let plan: any | null = null;
    let slots: { date: Date; time: string }[] = [];

    if (planJson) {
      try { plan = JSON.parse(planJson); } catch {}
    }
    if (slotsJson) {
      try {
        const parsed: Array<{ date: string; time: string }> = JSON.parse(slotsJson);
        slots = parsed.map(s => ({ date: new Date(s.date), time: s.time }));
      } catch {}
    }
    return { plan, slots };
  }

  private navigateAfterAuth(): void {
    const redirect = this.storage.getItem('postLoginRedirect');

    // 1) Explicit redirect set earlier (e.g., schedule → checkout)
    if (redirect) {
      this.storage.removeItem('postLoginRedirect');

      if (redirect === 'private/checkout') {
        const { plan, slots } = this.getStoredPlanAndSlots();
        if (plan && slots.length > 0) {
          this.router.navigate([redirect], { state: { plan, slots } });
          return;
        }
      }
      this.router.navigate([redirect]);
      return;
    }

    // 2) Otherwise, if user already selected plan + slots → go to checkout
    const { plan, slots } = this.getStoredPlanAndSlots();
    if (plan && slots.length > 0) {
      this.router.navigate(['private/checkout'], { state: { plan, slots } });
    } else {
      // 3) Plain login/register → go home
      this.router.navigate(['private/home']);
    }
  }

  // ===== UPDATED: Login =====
  async submitLogin() {
    this.authError.set(null);
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    try {
      // Simulate sign-in (accepts any valid email & password)
      await fakeLatency(600);
      await fakeSignIn(this.lf.email.value!, this.lf.password.value!);

      // mark session as logged in
      this.auth.login(this.lf.email.value!);

      // smart redirect
      this.navigateAfterAuth();
    } catch (e: any) {
      this.authError.set(e?.message ?? 'Unable to sign in.');
    } finally {
      this.loading.set(false);
    }
  }

  // ===== UPDATED: Register =====
  async submitRegister() {
    this.authError.set(null);
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    try {
      // Simulate sign-up then auto-login
      await fakeLatency(800);

      const email = this.registerForm.get('email')?.value as string || 'newuser@example.com';
      this.auth.login(email);

      // same redirect rules as login
      this.navigateAfterAuth();
    } catch (e: any) {
      this.authError.set(e?.message ?? 'Unable to register.');
    } finally {
      this.loading.set(false);
    }
  }
}

// ----- Validators -----
function matchEmailsValidator(group: AbstractControl): ValidationErrors | null {
  const email = group.get('email')?.value;
  const confirm = group.get('confirmEmail')?.value;
  return email && confirm && email !== confirm ? { emailsMismatch: true } : null;
}
function matchPasswordsValidator(group: AbstractControl): ValidationErrors | null {
  const p1 = group.get('password')?.value;
  const p2 = group.get('confirmPassword')?.value;
  return p1 && p2 && p1 !== p2 ? { passwordsMismatch: true } : null;
}

// ----- Fake API -----
function fakeLatency(ms: number) { return new Promise(res => setTimeout(res, ms)); }
function fakeSignIn(email: string, password: string) {
  // Any valid email + >=6 char password passes
  const valid = /\S+@\S+\.\S+/.test(email) && typeof password === 'string' && password.length >= 6;
  return valid ? Promise.resolve() : Promise.reject(new Error('Invalid email or password.'));
}
