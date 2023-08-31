import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCryptoComponent } from './add-crypto.component';

describe('AddCryptoComponent', () => {
  let component: AddCryptoComponent;
  let fixture: ComponentFixture<AddCryptoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddCryptoComponent]
    });
    fixture = TestBed.createComponent(AddCryptoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
