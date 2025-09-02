import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy, Renderer2, ElementRef, inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Plan } from '../schedule-classes/schedule-classes';

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

  // Ejemplo: dentro del componente Home (public)
  plans = [
    {
      cost: 150,
      sessions: 1,
      title: 'Trial Class',
      description: 'A single trial class to experience our method.',
      features: ['45-minute live session', 'Personalized feedback'],
      tag: null,
      tagColor: ''
    },
    {
      cost: 100,
      sessions: 5,
      title: 'Starter Pack',
      description: 'Perfect for getting comfortable and seeing progress.',
      features: [
        '5 live sessions',
        'Progress tracking',
        'Flexible scheduling',
        'Access to practice materials'
      ],
      tag: 'Most Popular',
      tagColor: 'bg-sky-500'
    },
    {
      cost: 90,
      sessions: 10,
      title: 'Immersion Pack',
      description: 'The complete package for serious, rapid improvement.',
      features: [
        '10 live sessions',
        'Dedicated support',
        'Priority scheduling',
        'Changes to scheduling',
        'Class re schedule',
        'All practice materials'
      ],
      tag: 'Best Value',
      tagColor: 'bg-emerald-500'
    }
  ];


  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private r2: Renderer2,
    private host: ElementRef<HTMLElement>,
    private router: Router,
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

  private platformId = inject(PLATFORM_ID);
  choose(plan: Plan) {
    const isBrowser = isPlatformBrowser(this.platformId);

    if (isBrowser) {
      // Optional: persist in sessionStorage to survive refreshes
      sessionStorage.setItem('selectedPlan', JSON.stringify(plan));

    }

    // Navigate passing router state
    this.router.navigate(['public/schedule'], { state: { plan } });
  }
}