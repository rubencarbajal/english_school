import { NgClass } from '@angular/common';
import { Component, HostListener, signal } from '@angular/core';

@Component({
  selector: 'app-upper-nav',
  imports: [NgClass],
  templateUrl: './upper-nav.html',
  styleUrl: './upper-nav.scss'
})
export class UpperNav {
  // A signal to track the scroll state.
  isScrolled = signal(false);

  // A listener that triggers on the window's scroll event.
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Check if the user has scrolled more than 10 pixels from the top.
    const verticalOffset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isScrolled.set(verticalOffset > 10);
  }
}
