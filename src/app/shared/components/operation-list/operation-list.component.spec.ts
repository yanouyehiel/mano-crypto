import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationListComponent } from './operation-list.component';

describe('OperationListComponent', () => {
  let component: OperationListComponent;
  let fixture: ComponentFixture<OperationListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OperationListComponent]
    });
    fixture = TestBed.createComponent(OperationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
