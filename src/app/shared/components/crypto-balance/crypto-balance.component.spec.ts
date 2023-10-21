import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryptoBalanceComponent } from './crypto-balance.component';

describe('CryptoBalanceComponent', () => {
  let component: CryptoBalanceComponent;
  let fixture: ComponentFixture<CryptoBalanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CryptoBalanceComponent]
    });
    fixture = TestBed.createComponent(CryptoBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
