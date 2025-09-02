import { Component, HostListener, OnDestroy, OnInit, Renderer2, ElementRef } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements  OnInit, OnDestroy {
  private rafId: number | null = null;
  private hue = 210; // base hue (blue-ish). Will drift subtly.
  private angle = 45; // gradient angle
  private t = 0; // time accumulator for animations


  // Theme: 'light' | 'dark'
  theme: 'light' | 'dark' = 'light';


  constructor(private r2: Renderer2, private host: ElementRef<HTMLElement>) { }


  ngOnInit(): void {
    // Initialize CSS variables for dynamic background
    this.setVar('--hue', String(this.hue));
    this.setVar('--angle', this.angle + 'deg');


    // Kick off animation loop
    const animate = () => {
      this.t += 0.016; // ~60fps
      // Gentle hue oscillation
      const hue = 200 + Math.sin(this.t * 0.25) * 20; // 180–220
      const angle = 30 + Math.sin(this.t * 0.18) * 30; // 0–60
      this.setVar('--hue', hue.toFixed(2));
      this.setVar('--angle', angle.toFixed(2) + 'deg');


      // Subtle blob positions
      const x = 50 + Math.sin(this.t * 0.4) * 20; // 30–70
      const y = 40 + Math.cos(this.t * 0.33) * 18; // 22–58
      this.setVar('--blob-x', x.toFixed(2) + '%');
      this.setVar('--blob-y', y.toFixed(2) + '%');


      this.rafId = requestAnimationFrame(animate);
    };
    this.rafId = requestAnimationFrame(animate);
  }


  ngOnDestroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }


  private setVar(name: string, value: string) {
    this.r2.setStyle(this.host.nativeElement, name, value);
  }


  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    // Parallax intensity
    const ix = (e.clientX / window.innerWidth - 0.5) * 2; // -1..1
    const iy = (e.clientY / window.innerHeight - 0.5) * 2; // -1..1
    this.setVar('--parallax-x', (ix * 6).toFixed(2) + 'px');
    this.setVar('--parallax-y', (iy * 6).toFixed(2) + 'px');
  }


  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    const root = document.documentElement;
    if (this.theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
  }
}