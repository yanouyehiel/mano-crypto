import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectCryptoModalComponent } from './select-crypto-modal.component';

describe('SelectCryptoModalComponent', () => {
  let component: SelectCryptoModalComponent;
  let fixture: ComponentFixture<SelectCryptoModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelectCryptoModalComponent]
    });
    fixture = TestBed.createComponent(SelectCryptoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
