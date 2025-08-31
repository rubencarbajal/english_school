import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpperNav } from './upper-nav';

describe('UpperNav', () => {
  let component: UpperNav;
  let fixture: ComponentFixture<UpperNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpperNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpperNav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
