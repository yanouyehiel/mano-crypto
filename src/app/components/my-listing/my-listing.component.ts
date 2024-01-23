import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ALL } from 'dns';
import { Table } from 'src/app/models/Table';
import { ResponseTransactionList } from 'src/app/models/Transaction';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
  selector: 'app-my-listing',
  templateUrl: './my-listing.component.html',
  styleUrls: ['./my-listing.component.scss']
})
export class MyListingComponent implements OnInit {
  public historics: ResponseTransactionList[] = [];
  public loader: boolean = true;
  private userSaved = localStorage.getItem('user-mansexch')

  constructor(private transacService: TransactionService, private router: Router) {
    if (this.userSaved == null) {
      this.router.navigate(['/auth/login'])
    }
  }

  ngOnInit(): void {
      
  }
}
