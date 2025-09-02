// guards/private.guard.ts
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';       // adjust import path
import { Storage } from '../services/storage'; // SSR-safe wrapper

export const privateGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const auth = inject(Auth);
  const router = inject(Router);
  const storage = inject(Storage);

  // ✅ Already logged in → allow navigation
  if (auth.isLoggedIn()) {
    return true;
  }

  // ❌ Not logged in → remember intended private URL for after login
  storage.setItem('postLoginRedirect', state.url);

  // ✅ Replace "/private" with "/public" if possible
  if (state.url.startsWith('/private/')) {
    const publicUrl = state.url.replace(/^\/private/, '/public');
    return router.parseUrl(publicUrl);
  }

  // fallback: always send to /public/home
  return router.parseUrl('/public/home');
};
