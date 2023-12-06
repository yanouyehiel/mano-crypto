import { DecimalPipe } from '@angular/common';
import { Component, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SortableDirective, SortEvent } from 'src/app/directives/sortable.directive';
import { TableUser } from 'src/app/models/Table';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-users-admin',
  templateUrl: './users-admin.component.html',
  styleUrls: ['./users-admin.component.scss']
})
export class UsersAdminComponent {
  table: any[] = []
  public num: number = 0
  
  constructor(private userService: UserService, private router: Router) {
    this.userService.getUsersByCountryCode().subscribe((res: any) => {
      this.table = res.data
      console.log(this.table)
    })
  }

  increment(): number {
    return this.num++
  }

  redirectInfoUser(id: string) {
    this.router.navigate([`admin/users/${id}`])
  }
  
}
