// storage.service.ts
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class Storage {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private mem = new Map<string, string>();

  getItem(key: string): string | null {
    return this.isBrowser ? window.sessionStorage.getItem(key) : this.mem.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    if (this.isBrowser) window.sessionStorage.setItem(key, value);
    else this.mem.set(key, value);
  }
  removeItem(key: string): void {
    if (this.isBrowser) window.sessionStorage.removeItem(key);
    else this.mem.delete(key);
  }
  clear(): void {
    if (this.isBrowser) window.sessionStorage.clear();
    else this.mem.clear();
  }
}
