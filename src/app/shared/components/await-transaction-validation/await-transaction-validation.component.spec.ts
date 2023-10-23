import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AwaitTransactionValidationComponent } from './await-transaction-validation.component';

describe('AwaitTransactionValidationComponent', () => {
  let component: AwaitTransactionValidationComponent;
  let fixture: ComponentFixture<AwaitTransactionValidationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AwaitTransactionValidationComponent]
    });
    fixture = TestBed.createComponent(AwaitTransactionValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
