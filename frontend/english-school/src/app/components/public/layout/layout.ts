import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UpperNav } from '../upper-nav/upper-nav';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, UpperNav],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout { }