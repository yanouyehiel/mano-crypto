import { Component, OnInit } from '@angular/core';
import { ProfileUser} from 'src/app/models/User';


@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent implements OnInit{
  public user!: ProfileUser

  constructor() {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user-mansexch')!).user
  }
 
}
