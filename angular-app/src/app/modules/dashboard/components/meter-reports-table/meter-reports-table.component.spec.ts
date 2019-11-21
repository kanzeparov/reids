import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeterReportsTableComponent } from './meter-reports-table.component';

describe('MeterReportsTableComponent', () => {
  let component: MeterReportsTableComponent;
  let fixture: ComponentFixture<MeterReportsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeterReportsTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeterReportsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
