import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

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
      this.router.navigate(['private/dashboard']);
    } catch (e: any) {
      this.authError.set(e?.message ?? 'Unable to sign in.');
    } finally {
      this.loading.set(false);
    }
  }

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
      this.router.navigate(['private/dashboard']);
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