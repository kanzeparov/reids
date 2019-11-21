import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OffsetBlockComponent } from './offset-block.component';

describe('OffsetBlockComponent', () => {
  let component: OffsetBlockComponent;
  let fixture: ComponentFixture<OffsetBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OffsetBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OffsetBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
