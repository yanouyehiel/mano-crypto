import { Component, OnInit } from '@angular/core';
import { ProfileUser, ResponseProfile, User } from 'src/app/models/User';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent implements OnInit {
  public user!: ProfileUser

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.getProfile()
  }

  getProfile() {
    this.userService.getProfile().subscribe((result: ResponseProfile) => {
      console.log(result.data)
      this.user = {
        id: result.data?.user.id,
        name: result.data?.user.name,
        email: result.data?.user.email,
        phone: result.data?.user.phoneNumber,
        isVerify: result.data?.user.isVerified
      }
      localStorage.setItem('user-mansexch', JSON.stringify(result.data))
    })
  }
}
