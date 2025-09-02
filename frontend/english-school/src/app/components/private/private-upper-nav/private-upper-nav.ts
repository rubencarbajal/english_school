import { NgClass } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '../../../services/storage'; // SSR-safe wrapper
import { Auth } from '../../../services/auth';

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
     private storage = inject(Storage);
     private auth = inject(Auth);

  logout() {
    // console.log('Logging out...');
   
    this.storage.removeItem('authToken');
    this.storage.removeItem('authEmail');
    this.auth.logout();
    sessionStorage.clear(); // Clear session storage on logout
    // 3. Redirect to login/auth page
    this.router.navigate(['/public/home']);
  }

  gotocheckiut() {
    console.log('Navigating to checkout...');
    this.router.navigate(['/private/checkout']);
  }
}
