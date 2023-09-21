import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataCryptoService {

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
}
