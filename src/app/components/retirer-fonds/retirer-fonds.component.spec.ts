import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetirerFondsComponent } from './retirer-fonds.component';

describe('RetirerFondsComponent', () => {
  let component: RetirerFondsComponent;
  let fixture: ComponentFixture<RetirerFondsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RetirerFondsComponent]
    });
    fixture = TestBed.createComponent(RetirerFondsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
