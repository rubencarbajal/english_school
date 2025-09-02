// guards/private.guard.ts
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';       // adjust path
import { Storage } from '../services/storage'; // SSR-safe wrapper

export const privateGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const auth = inject(Auth);
  const router = inject(Router);
  const storage = inject(Storage);

  // already logged in → allow
  if (auth.isLoggedIn()) return true;

  // remember intended private URL so we can resume after login
  storage.setItem('postLoginRedirect', state.url);

  // map /private/... → /public/...
  let publicUrl = '/home';
  if (state.url.startsWith('/private/')) {
    publicUrl = state.url.replace(/^\/private\//, '/public/');
  } else if (state.url === '/private' || state.url === '/private/') {
    publicUrl = '/public';
  }

  // redirect to the public counterpart
  return router.parseUrl(publicUrl);
};
