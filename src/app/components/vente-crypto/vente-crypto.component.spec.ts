import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenteCryptoComponent } from './vente-crypto.component';

describe('VenteCryptoComponent', () => {
  let component: VenteCryptoComponent;
  let fixture: ComponentFixture<VenteCryptoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VenteCryptoComponent]
    });
    fixture = TestBed.createComponent(VenteCryptoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
