import { Component } from '@angular/core';
import { PrivateUpperNav } from '../private-upper-nav/private-upper-nav';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [PrivateUpperNav, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

}
