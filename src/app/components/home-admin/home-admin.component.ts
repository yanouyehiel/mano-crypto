import { Component, OnInit } from '@angular/core';
import * as chartData from '../../shared/data/chartData'
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-home-admin',
  templateUrl: './home-admin.component.html',
  styleUrls: ['./home-admin.component.scss']
})
export class HomeAdminComponent implements OnInit {
  public growthChart = chartData.growthChart;
  private users: any

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUsersStatistics().subscribe((res: any) => {
      this.users = res.data.users
      console.log(this.users)
      this.growthChart.series = [this.users.total_users, this.users.connected_users, this.users.unconnected_users]
    })
  }
}
