import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  imports: [ CommonModule, ReactiveFormsModule, RouterLink ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPassword implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // token
  token = signal<string | null>(null);

  // UI state
  loading = signal(false);
  done = signal(false);
  error = signal<string | null>(null);
  showPass1 = signal(false);
  showPass2 = signal(false);

  // Form
  form = this.fb.group(
    {
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          // At least 1 lowercase, 1 uppercase, 1 number
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: [matchPasswordsValidator] }
  );

  get f() {
    return this.form.controls;
  }

  passwordHelp = computed(() =>
    'Use at least 8 characters with a mix of upper/lowercase letters and numbers.'
  );

  ngOnInit(): void {
    // Prefer path param, fallback to query param
    const viaParam = this.route.snapshot.paramMap.get('token');
    const viaQuery = this.route.snapshot.queryParamMap.get('token');
    this.token.set(viaParam || viaQuery);

    if (!this.token()) {
      this.error.set('Invalid or missing reset token.');
    }
  }

  async submit() {
    this.error.set(null);

    if (!this.token()) {
      this.error.set('Invalid or missing reset token.');
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    try {
      await simulateResetApi({
        token: this.token()!,
        newPassword: this.f.password.value!,
      });
      this.done.set(true);

      // Redirect to login after brief delay
      setTimeout(() => this.router.navigate(['/auth']), 1000);
    } catch (e: any) {
      this.error.set(e?.message ?? 'Unable to reset password. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}

// --- Validators ---
function matchPasswordsValidator(group: AbstractControl): ValidationErrors | null {
  const p1 = group.get('password')?.value;
  const p2 = group.get('confirmPassword')?.value;
  return p1 && p2 && p1 !== p2 ? { passwordsMismatch: true } : null;
}

// --- Fake API ---
function simulateResetApi(input: { token: string; newPassword: string }) {
  // Simulate token check + success
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      // Accept any non-empty token
      input.token ? resolve() : reject(new Error('Invalid reset token.'));
    }, 800);
  });
}