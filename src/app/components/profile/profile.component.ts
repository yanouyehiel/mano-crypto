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
    this.user = JSON.parse(localStorage.getItem('user-mansexch')!).user
    console.log(this.user)
  }

  openProfileEdit(): any {
    this.router.navigate(['/client/profile-edit'])
  }

}

