import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.scss']
})
export class OperationsComponent implements OnInit {
  private userSaved: any;
  
  constructor(private router: Router, private userService: UserService) {
    if (this.userSaved == undefined) {
      this.router.navigate(['/auth/login'])
    }
  }

  ngOnInit(): void {
    this.getProfileUser()
  }

  getProfileUser(): void {
    this.userService.getProfile().subscribe((response: any) => {
      this.userSaved = response.data.user
    }, (err) => {
      if (err.status === 401) {
        this.router.navigate(['/auth/login'])
      }
    })
  }
}
