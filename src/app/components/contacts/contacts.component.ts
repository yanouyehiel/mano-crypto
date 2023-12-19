import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
  users? :any[]
filterName:string='l'
  constructor(private userService:UserService) { }

  ngOnInit(): void {
    this.fetchUsers({})
  }
  getFilterName(event:any){
    console.log(event+" The filter")
    this.filterName=event
  }
 
  fetchUsers(criteria:any){
    this.userService.getUsersByCriteria(criteria).subscribe((res: any) => {
      this.users = res.data
    })
  }

}
