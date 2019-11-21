import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountBalanceRadioComponent } from './account-balance-radio.component';

describe('AccountBalanceRadioComponent', () => {
  let component: AccountBalanceRadioComponent;
  let fixture: ComponentFixture<AccountBalanceRadioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountBalanceRadioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountBalanceRadioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
