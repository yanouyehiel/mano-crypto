import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashbordUserComponent } from './dashbord-user.component';

describe('DashbordUserComponent', () => {
  let component: DashbordUserComponent;
  let fixture: ComponentFixture<DashbordUserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashbordUserComponent]
    });
    fixture = TestBed.createComponent(DashbordUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
