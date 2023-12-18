import { Component, OnInit } from '@angular/core';
import * as chartData from '../../shared/data/chartData'
import { UserService } from 'src/app/services/user.service';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-home-admin',
  templateUrl: './home-admin.component.html',
  styleUrls: ['./home-admin.component.scss']
})
export class HomeAdminComponent implements OnInit {
  public growthChart = chartData.growthChart;
  private users: any
  private solde: any
  public datas:any
  private transaction: any
  public barChart = chartData.barChart

  constructor(private userService: UserService, private adminService:AdminService) {}

  ngOnInit(): void {
    this.fetchStatistics('all')
  }
  fetchStatistics(country:string){
    this.userService.getUsersStatistics(country).subscribe((res: any) => {
      this.datas = res.data
      this.users = res.data.users
      this.growthChart.series = [this.users.total_users, this.users.connected_users, this.users.unconnected_users]
      this.solde = res.data.wallets
      this.transaction = res.data.transactions
      this.barChart.series[0].data = [
        this.solde.XAF_balance,
        this.solde.BTC_balance,
        this.solde.ETH_balance,
        this.transaction.deposit_transactions_amount,
        this.transaction.withdraw_transactions_amount,
        this.transaction.crypto_recharge_transactions_amount,
        this.transaction.crypto_withdraw_transactions_amount
      ]
    })
  }
}
