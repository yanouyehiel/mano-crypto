import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  ResponseDeposit,
  ResponseParent,
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
  

  private getConfig() {
    let tokenRegistred: any = localStorage.getItem('token-mansexch');
  let data: any = JSON.parse(tokenRegistred);
    return{
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.token}`,
    }),}
  };

  constructor(private http: HttpClient) {}

  getProfile(): Observable<ResponseProfile> {
    return this.http.get<ResponseProfile>(
      `${this.urlUser}/profile`,
      this.getConfig()
    );
  }

  addDeposit(data: any): Observable<ResponseDeposit> {
    return this.http.post<ResponseDeposit>(
      `${this.urlDeposit}/deposits`,
      data,
      this.getConfig()
    );
  }
  
  withdraw(data: any): Observable<ResponseDeposit> {
    return this.http.post<ResponseDeposit>(
      `${this.urlDeposit}/withdraw`,
      data,
      this.getConfig()
    );
  }

  getAllTransaction( page:number,type?:string,): Observable<ResponseTransactionList> {
      return this.http.get<ResponseTransactionList>(
        `${this.urlTransactionList}/all?page=${page}&limit=25${type?"&type="+type:''}`,
        this.getConfig()
      ).pipe(catchError((error)=> of(error.error)));
    
  }

  getSingleTransaction(idTransaction: string): Observable<ResponseParent> {
    return this.http.get<ResponseParent>(
      `${this.urlTransactionList}/${idTransaction}`,
      this.getConfig()
    ).pipe(catchError((error)=> of(error.error)));
  }

  getFees(data: any): Observable<ResponseParent> {
    return this.http.post<ResponseParent>(
        `${this.urlDeposit}/fees`,
        data,
        this.getConfig()
    ).pipe(catchError((error) => {
        return of(error.error)
    }));
}
}
