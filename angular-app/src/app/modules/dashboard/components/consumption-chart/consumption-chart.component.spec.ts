import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumptionChartComponent } from './consumption-chart.component';

describe('ConsumptionChartComponent', () => {
  let component: ConsumptionChartComponent;
  let fixture: ComponentFixture<ConsumptionChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsumptionChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsumptionChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
