import { DecimalPipe } from '@angular/common';
import { Component, QueryList, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs';
import { SortableDirective, SortEvent } from 'src/app/directives/sortable.directive';
import { TableUser } from 'src/app/models/Table';
import { TablesService } from 'src/app/services/tables.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-users-admin',
  templateUrl: './users-admin.component.html',
  styleUrls: ['./users-admin.component.scss'],
  providers: [TablesService, DecimalPipe]
})
export class UsersAdminComponent {
  basicTable$: Observable<any[]>;
  total$: Observable<number>;

  @ViewChildren(SortableDirective) headers!: QueryList<SortableDirective>;
  
  constructor(public service: TablesService, private userService: UserService) {
    this.basicTable$ = service.basicTable$;
    this.total$ = service.total$;
    console.log(this.basicTable$)
    /*this.userService.getUsersByCountryCode().subscribe((res: any) => {
      this.basicTable$ = res.data
    })*/
  }
  
  
  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });
    this.service.sortColumn = column;
    this.service.sortDirection = direction;
  }

  deleteData(id: string){
    this.basicTable$.subscribe((data: any)=> {      
      data.map((elem: any,i: any)=>{elem.id == id && data.splice(i,1)})
      
    })
  }
}
