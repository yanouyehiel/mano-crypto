import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseParent } from '../models/Transaction';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataCryptoService {


  private urlDeposit = environment.backend_api_url + environment.url_deposit

  private getConfig() {
    let tokenRegistred: any = localStorage.getItem('token-mansexch')
    let data: any = JSON.parse(tokenRegistred)
    return {
      headers: new HttpHeaders(
        {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${data.token}`
        }
      )
    }
  }

  constructor(private http: HttpClient) { }

  getWalletDetails(): Observable<ResponseParent> {
    return this.http.get<ResponseParent>(`${this.urlDeposit}/details`, this.getConfig())
  }
}
