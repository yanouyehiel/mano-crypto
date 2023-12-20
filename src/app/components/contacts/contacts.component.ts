import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
  users? :any[]
filterName:string
usersLength:number
public criteriaFilter:any
  constructor(private adminService:AdminService) { }

  ngOnInit(): void {
    this.fetchUsers({criteria:{}, page:1})
  }
  getFilterName(event:any){
    this.filterName=event
  }
 
  fetchUsers(bodyFilter:any){
    this.criteriaFilter = bodyFilter.criteria
    this.adminService.getUsersByCriteria(bodyFilter).subscribe((res: any) => {
      this.users = res.data.users
      this.usersLength = res.data.total_users
    })
  }

}
