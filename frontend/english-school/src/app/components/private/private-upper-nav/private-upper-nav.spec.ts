import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateUpperNav } from './private-upper-nav';

describe('PrivateUpperNav', () => {
  let component: PrivateUpperNav;
  let fixture: ComponentFixture<PrivateUpperNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivateUpperNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivateUpperNav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
