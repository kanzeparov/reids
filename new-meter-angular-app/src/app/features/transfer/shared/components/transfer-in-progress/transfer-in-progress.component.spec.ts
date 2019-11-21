import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferInProgressComponent } from './transfer-in-progress.component';

describe('TransferInProgressComponent', () => {
  let component: TransferInProgressComponent;
  let fixture: ComponentFixture<TransferInProgressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferInProgressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferInProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
