import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);

  loading = signal(false);
  resetSent = signal(false);
  sentToEmail = signal<string>('');
  countdown = signal(0); // seconds left to enable "Resend"
  canResend = computed(() => this.countdown() === 0);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });
  get email() { return this.form.controls.email; }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    try {
      // Simulate API call
      await delay(800);
      this.sentToEmail.set(this.form.value.email!);
      this.resetSent.set(true);
      this.startCountdown(30); // 30s cooldown before resend
    } finally {
      this.loading.set(false);
    }
  }

  async resend() {
    if (!this.canResend()) return;
    this.loading.set(true);
    try {
      await delay(600); // simulate re-send
      this.startCountdown(30);
    } finally {
      this.loading.set(false);
    }
  }

  openEmailApp() {
    if (isPlatformBrowser(this.platformId)) {
      const addr = this.sentToEmail() || this.form.value.email || '';
      // Try to open default mail client
      window.location.href = `mailto:${addr}`;
    }
  }

  maskedEmail(email: string) {
    const [user, domain] = email.split('@');
    if (!user || !domain) return email;
    const visible = Math.min(2, user.length);
    return `${user.slice(0, visible)}${'•'.repeat(Math.max(0, user.length - visible))}@${domain}`;
  }

  private startCountdown(sec: number) {
    this.countdown.set(sec);
    if (!isPlatformBrowser(this.platformId)) return; // avoid timers during SSR
    const t = setInterval(() => {
      const next = this.countdown() - 1;
      this.countdown.set(Math.max(0, next));
      if (next <= 0) clearInterval(t);
    }, 1000);
  }
}

function delay(ms: number) {
  return new Promise<void>(res => setTimeout(res, ms));
}