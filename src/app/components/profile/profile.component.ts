import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileUser, ResponseProfile } from 'src/app/models/User';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  public user!: ProfileUser;

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit(): void {
    this.getProfile()
  }

  openProfileEdit(): any {
    this.router.navigate(['/client/profile-edit'])
  }

  getProfile() {
    this.userService.getProfile().subscribe((result: ResponseProfile) => {
      console.log(result.data)
      this.user = {
        id: result.data?.user.id,
        name: result.data?.user.name,
        email: result.data?.user.email,
        phone: result.data?.user.phoneNumber,
        isPhoneVerified: result.data?.user.isPhoneNumberVerified,
        isEmailVerified: result.data?.user.isEmailVerified
      }
    })
  }
}

