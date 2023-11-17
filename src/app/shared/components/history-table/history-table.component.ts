import { Component, Input, OnInit } from '@angular/core';
import { catchError, of } from 'rxjs';
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
    this.depositService.getAllTransaction({transactionType:this.type}).pipe(
      catchError((error)=>{
        return of(error.error)
      })
    ).subscribe((response: ResponseTransactionList) => {

    if(response.statusCode!=1000){
      this.errorDisplay = "Impossible de charger les donnees, "+response.message?response.message:" Problème de réseau ";
    }
    else{
      this.recentOrders = response.data.transactions.reverse().slice(0, 9)
    }
      this.loader = false;

    })
}

}
