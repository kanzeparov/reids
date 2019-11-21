import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferErrorComponent } from './transfer-error.component';

describe('TransferErrorComponent', () => {
  let component: TransferErrorComponent;
  let fixture: ComponentFixture<TransferErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
