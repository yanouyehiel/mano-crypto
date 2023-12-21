import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  ResponseDeposit,
  ResponseTransactionList,
} from '../models/Transaction';
import { ResponseProfile } from '../models/User';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private urlDeposit = environment.backend_api_url + environment.url_deposit;
  private urlUser = environment.backend_api_url + environment.user_url;
  private urlTransactionList = environment.backend_api_url + environment.url_transaction_list;
  private tokenRegistred: any = localStorage.getItem('token-mansexch');
  private data: any = JSON.parse(this.tokenRegistred);

  private config = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.data.token}`,
    }),
  };

  constructor(private http: HttpClient) {}

  getProfile(): Observable<ResponseProfile> {
    return this.http.get<ResponseProfile>(
      `${this.urlUser}/profile`,
      this.config
    );
  }

  addDeposit(data: any): Observable<ResponseDeposit> {
    return this.http.post<ResponseDeposit>(
      `${this.urlDeposit}/deposits`,
      data,
      this.config
    );
  }
  
  withdraw(data: any): Observable<ResponseDeposit> {
    return this.http.post<ResponseDeposit>(
      `${this.urlDeposit}/withdraw`,
      data,
      this.config
    );
  }

  getAllTransaction(type:string, page:number): Observable<ResponseTransactionList> {
      return this.http.get<ResponseTransactionList>(
        `${this.urlTransactionList}/all?type=${type}&page=${page}&limit=25`,
        this.config
      ).pipe(catchError((error)=> of(error.error)));
    
  }
}
