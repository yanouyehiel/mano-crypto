import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareToFriendComponent } from './share-to-friend.component';

describe('ShareToFriendComponent', () => {
  let component: ShareToFriendComponent;
  let fixture: ComponentFixture<ShareToFriendComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShareToFriendComponent]
    });
    fixture = TestBed.createComponent(ShareToFriendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
