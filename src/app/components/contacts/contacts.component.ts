import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
public loader: boolean = true;
public criteriaFilter:any = {}
private userSaved = localStorage.getItem('user-mansexch')

  constructor(private adminService:AdminService, private router: Router) {
    if (this.userSaved == null) {
      this.router.navigate(['/auth/login'])
    }
  }

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
      this.loader = false;
    })
  }
  fetchUsersWithTerm(termFilter:any){
    this.fetchUsers({criteria:{...this.criteriaFilter, ...termFilter}, page:1})
  }

}
