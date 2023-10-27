import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseCryptoFee } from '../models/Transaction';
@Injectable({
  providedIn: 'root',
})
export class CryptoTransactionService {
  private cryptoUrl = environment.backend_api_url + environment.cryptoUrl;
  private tokenRegistred: any = localStorage.getItem('token-mansexch');
  private data: any = JSON.parse(this.tokenRegistred);

  private config = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.data.token}`,
    }),
  };

  constructor(private http: HttpClient) {}

  getCryptoFees(data: any): Observable<ResponseCryptoFee> {
    return this.http
      .post<ResponseCryptoFee>(
        `${this.cryptoUrl}/get-buy-crypto-fees`,
        data,
        this.config
      );
  }

  buyCrypto(data: any): Observable<ResponseCryptoFee> {
    return this.http
      .post<ResponseCryptoFee>(`${this.cryptoUrl}/init-buy`, data, this.config);
  }
}
