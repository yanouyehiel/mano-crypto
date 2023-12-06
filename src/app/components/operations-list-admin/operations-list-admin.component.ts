import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-operations-list-admin',
  templateUrl: './operations-list-admin.component.html',
  styleUrls: ['./operations-list-admin.component.scss']
})
export class OperationsListAdminComponent implements OnInit {
  private id: string = ""
  public transactions: any[] = []
  public table: any[] = []

  constructor(private activatedRoute: ActivatedRoute, private userService: UserService) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((data: any) => {
      this.id = data['id']
    })

    this.userService.getUsersTransactions().subscribe((res: any) => {
      this.table = res.data

      this.transactions = this.table.filter(transaction => transaction._id === this.id);
    })
  }
}
