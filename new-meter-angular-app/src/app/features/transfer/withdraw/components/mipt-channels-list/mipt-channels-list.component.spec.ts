import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MiptChannelsListComponent } from './mipt-channels-list.component';

describe('MiptChannelsListComponent', () => {
  let component: MiptChannelsListComponent;
  let fixture: ComponentFixture<MiptChannelsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MiptChannelsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MiptChannelsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
