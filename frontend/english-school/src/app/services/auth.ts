// auth.service.ts
import { Injectable, signal, inject } from '@angular/core';
import { Storage } from './storage'; // your SSR-safe wrapper

@Injectable({ providedIn: 'root' })
export class Auth {
  private storage = inject(Storage);
  user = signal<{ email: string } | null>(null);

  constructor() {
    const token = this.storage.getItem('authToken');
    const email = this.storage.getItem('authEmail');
    if (token && email) this.user.set({ email });
  }

  isLoggedIn(): boolean { console.log('is logged in here' ,!!this.user()); return !!this.user(); }

  // Call this after a successful login (even if simulated)
  login(email: string, token = 'demo-token') {
    this.storage.setItem('authToken', token);
    this.storage.setItem('authEmail', email);
    this.user.set({ email });
  }

  logout() {
    this.storage.removeItem('authToken');
    this.storage.removeItem('authEmail');
    this.user.set(null);
    sessionStorage.clear(); // Clear session storage on logout
  }
}
