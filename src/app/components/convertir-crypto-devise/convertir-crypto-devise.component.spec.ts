import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvertirCryptoDeviseComponent } from './convertir-crypto-devise.component';

describe('ConvertirCryptoDeviseComponent', () => {
  let component: ConvertirCryptoDeviseComponent;
  let fixture: ComponentFixture<ConvertirCryptoDeviseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConvertirCryptoDeviseComponent]
    });
    fixture = TestBed.createComponent(ConvertirCryptoDeviseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
