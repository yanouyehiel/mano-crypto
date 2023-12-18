import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
  users :any[] = []

  constructor(private userService:UserService) { }

  ngOnInit(): void {
    this.fetchUsers()

  }
 
  fetchUsers(){
    this.userService.getUsersByCountryCode().subscribe((res: any) => {
      this.users = res.data
    })
  }

}
