import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencyBalanceComponent } from './currency-balance.component';

describe('CurrencyBalanceComponent', () => {
  let component: CurrencyBalanceComponent;
  let fixture: ComponentFixture<CurrencyBalanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CurrencyBalanceComponent]
    });
    fixture = TestBed.createComponent(CurrencyBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
