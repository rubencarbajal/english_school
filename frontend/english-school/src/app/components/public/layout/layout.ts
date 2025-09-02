import { Component } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { UpperNav } from '../upper-nav/upper-nav';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, UpperNav],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout { 
  home: boolean;

  constructor(private router: ActivatedRoute) {
    this.home = this.router.snapshot.routeConfig?.path === 'home';
  }
  
}