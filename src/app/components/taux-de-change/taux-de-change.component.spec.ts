import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TauxDeChangeComponent } from './taux-de-change.component';

describe('TauxDeChangeComponent', () => {
  let component: TauxDeChangeComponent;
  let fixture: ComponentFixture<TauxDeChangeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TauxDeChangeComponent]
    });
    fixture = TestBed.createComponent(TauxDeChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
