import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Table } from 'src/app/models/Table';
import { ResponseTransactionList } from 'src/app/models/Transaction';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
  selector: 'app-my-listing',
  templateUrl: './my-listing.component.html',
  styleUrls: ['./my-listing.component.scss']
})
export class MyListingComponent implements OnInit {
  public historics: any[] = [];
  public loader: boolean;

  constructor(private transacService: TransactionService) {}

  ngOnInit(): void {
    this.loader = true;
    this.getAllTransaction()
  }

  getAllTransaction(): void {
    try {
      this.loader = false;
      this.transacService.getAllTransaction().subscribe((response: ResponseTransactionList) => {
        this.historics = response.data.transactions
      })
    } catch (error) {
      console.log(error)
    }
  }
}
