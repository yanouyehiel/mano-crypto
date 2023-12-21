import { Component, Input, OnInit } from '@angular/core';
import { catchError, of } from 'rxjs';
import { ResponseParent } from 'src/app/models/Transaction';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
  selector: 'app-history-table',
  templateUrl: './history-table.component.html',
  styleUrls: ['./history-table.component.scss']
})
export class HistoryTableComponent implements OnInit {
  @Input() type: string

  loader: boolean = true
  recentOrders: any[]
  errorDisplay: string
  currentPage: number = 1;
  totalLenght: number;

  constructor(
    private depositService: TransactionService,
  ) { }

  ngOnInit(): void {
    this.getTransactions(1)
  }
  getTransactions(page: number): void {
    this.depositService.getAllTransaction(this.type, page).pipe(
      catchError((error) => {
        return of(error.error)
      })
    ).subscribe((response: ResponseParent) => {
      console.log(response)
      if (response.statusCode != 1000) {
        this.errorDisplay = "Impossible de charger les donnees, " + response.message ? response.message : " Problème de réseau ";
      }
      else {
        this.recentOrders = response.data.transactions
        this.currentPage = parseInt(response.data.currentPage)
        this.totalLenght = response.data.total_transactions
      }
      this.loader = false;

    })
  }



}
