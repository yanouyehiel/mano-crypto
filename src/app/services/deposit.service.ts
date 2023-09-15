import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseDeposit } from '../models/Deposit';
import { ResponseProfile } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class DepositService {

  private urlTransaction = environment.backend_api_url + environment.url_transaction
  private urlUser = environment.backend_api_url + environment.user_url
  private tokenRegistred: any = localStorage.getItem('token-mansexch')
  private data: any = JSON.parse(this.tokenRegistred)
  
  private config = {
    headers: new HttpHeaders(
      {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${this.data.token}`
      }
    )
  }
  
  constructor(private http: HttpClient) { }

  getProfile(): Observable<ResponseProfile> {
    return this.http.get<ResponseProfile>(`${this.urlUser}/profile`, this.config)
  }
  
  addDeposit(data: any): Observable<ResponseDeposit> {
    return this.http.post<ResponseDeposit>(`${this.urlTransaction}/deposits`, data, this.config)
  }
}
