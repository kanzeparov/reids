import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillDiffComponent } from './bill-diff.component';

describe('BillDiffComponent', () => {
  let component: BillDiffComponent;
  let fixture: ComponentFixture<BillDiffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillDiffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillDiffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
