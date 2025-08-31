import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleClasses } from './schedule-classes';

describe('ScheduleClasses', () => {
  let component: ScheduleClasses;
  let fixture: ComponentFixture<ScheduleClasses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleClasses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleClasses);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
