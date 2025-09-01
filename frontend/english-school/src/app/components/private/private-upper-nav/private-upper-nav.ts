import { NgClass } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-private-upper-nav',
  imports: [NgClass],
  templateUrl: './private-upper-nav.html',
  styleUrl: './private-upper-nav.scss'
})
export class PrivateUpperNav {
   // A signal to track the scroll state.
    isScrolled = signal(false);
  
    // A listener that triggers on the window's scroll event.
    @HostListener('window:scroll', [])
    onWindowScroll() {
      // Check if the user has scrolled more than 10 pixels from the top.
      const verticalOffset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      this.isScrolled.set(verticalOffset > 10);
    }


     private router = inject(Router);

  logout() {
    // 1. Clear stored auth state
    localStorage.removeItem('authToken');   // if you’re using a token
    sessionStorage.removeItem('selectedPlan'); // if you stored plan/session

    // 2. (Optional) Clear signals or reset AuthService state
    // this.authStore.clear();

    // 3. Redirect to login/auth page
    this.router.navigate(['/auth']);
  }

}
