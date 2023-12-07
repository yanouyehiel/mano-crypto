import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss'],
})
export class FileManagerComponent implements OnInit {
  @Input() datas: any = {};
  public users: any;
  public transactions: any;
  public wallets: any;
  constructor() {}

  ngOnInit(): void {
    this.users = this.datas.users;
    this.transactions = this.datas.transactions;
    this.wallets = this.datas.wallets;
  }
}
