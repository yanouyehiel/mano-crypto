import { Component, Input, OnInit } from '@angular/core';
import { ResponseTransactionList } from 'src/app/models/Transaction';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
  selector: 'app-history-table',
  templateUrl: './history-table.component.html',
  styleUrls: ['./history-table.component.scss']
})
export class HistoryTableComponent implements OnInit{
  @Input() type: string

  loader:boolean = true
  recentOrders:any[]
  errorDisplay:string

  constructor(
    private depositService: TransactionService,
    ){}

ngOnInit(): void {
this.getTransactions()
}
getTransactions(): void {
  try {
    this.depositService.getAllTransaction().subscribe((response: ResponseTransactionList) => {
      this.loader = false;
      this.recentOrders = response.data.transactions.filter((deposit) => deposit.type === this.type)
      console.log(response)
    })
  } catch (error) {
    this.errorDisplay = "Impossible de charger les donnees";
    this.loader = false
  }
}

}
