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
  public loader: boolean = true;

  constructor(private transacService: TransactionService) {}

  ngOnInit(): void {
    this.getAllTransaction()
  }

  getAllTransaction(): void {
    try {
      this.loader = true;
      this.transacService.getAllTransaction().subscribe((response: ResponseTransactionList) => {
        this.loader = false;
        this.historics = response.data.transactions
        console.log(response)
      })
    } catch (error) {
      console.log(error)
    }
  }
}
