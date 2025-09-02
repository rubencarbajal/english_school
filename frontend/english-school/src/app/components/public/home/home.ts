import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [CommonModule, RouterLink]
})
export class Home implements OnInit, OnDestroy {
private rafId: number | null = null;
private t = 0; // time accumulator for background motion
private browser = false;


constructor(
@Inject(PLATFORM_ID) platformId: Object,
private r2: Renderer2,
private host: ElementRef<HTMLElement>
) {
this.browser = isPlatformBrowser(platformId);
}


ngOnInit(): void {
// Initialize CSS variables for dynamic gradient
this.setVar('--hue-a', '200');
this.setVar('--hue-b', '220');
this.setVar('--angle', '35deg');
this.setVar('--blob-x', '60%');
this.setVar('--blob-y', '40%');


if (!this.browser) return; // SSR guard


const animate = () => {
this.t += 0.016; // ≈60fps
const hueBase = 205 + Math.sin(this.t * 0.15) * 18; // soft drift
const hueA = hueBase;
const hueB = hueBase + 25;
const angle = 25 + Math.sin(this.t * 0.1) * 25;
const bx = 55 + Math.sin(this.t * 0.35) * 18; // 37–73
const by = 45 + Math.cos(this.t * 0.28) * 16; // 29–61


this.setVar('--hue-a', hueA.toFixed(2));
this.setVar('--hue-b', hueB.toFixed(2));
this.setVar('--angle', angle.toFixed(2) + 'deg');
this.setVar('--blob-x', bx.toFixed(2) + '%');
this.setVar('--blob-y', by.toFixed(2) + '%');


this.rafId = requestAnimationFrame(animate);
};
this.rafId = requestAnimationFrame(animate);
}


ngOnDestroy(): void {
if (this.rafId !== null && this.browser) cancelAnimationFrame(this.rafId);
}


private setVar(name: string, value: string) {
this.r2.setStyle(this.host.nativeElement, name, value);
}
}