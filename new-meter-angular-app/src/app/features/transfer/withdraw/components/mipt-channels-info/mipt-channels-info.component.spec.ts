import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MiptChannelsInfoComponent } from './mipt-channels-info.component';

describe('MiptChannelsInfoComponent', () => {
  let component: MiptChannelsInfoComponent;
  let fixture: ComponentFixture<MiptChannelsInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MiptChannelsInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MiptChannelsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
