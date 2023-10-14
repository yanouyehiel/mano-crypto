import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellCryptoComponent } from './sell-crypto.component';

describe('SellCryptoComponent', () => {
  let component: SellCryptoComponent;
  let fixture: ComponentFixture<SellCryptoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SellCryptoComponent]
    });
    fixture = TestBed.createComponent(SellCryptoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
