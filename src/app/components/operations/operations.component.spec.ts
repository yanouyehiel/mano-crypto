import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationsComponent } from './operations.component';

describe('OperationsComponent', () => {
  let component: OperationsComponent;
  let fixture: ComponentFixture<OperationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OperationsComponent]
    });
    fixture = TestBed.createComponent(OperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
