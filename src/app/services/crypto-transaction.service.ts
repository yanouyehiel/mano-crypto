import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseCryptoFee, ResponseParent } from '../models/Transaction';
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

  getCryptoFees(data: any): Observable<ResponseParent> {
    return this.http.post<ResponseCryptoFee>(
      `${this.cryptoUrl}/get-crypto-fees`,
      data,
      this.config
    );
  }

  convertToFiat(data: any): Observable<ResponseParent> {
    return this.http.post<ResponseCryptoFee>(
      `${this.cryptoUrl}/convert-crypto-to-fiats`,
      data,
      this.config
    );
  }

  convertToCrypto(data: any): Observable<ResponseParent> {
    return this.http.post<ResponseCryptoFee>(
      `${this.cryptoUrl}/convert-fiat-to-cryptos`,
      data,
      this.config
    );
  }

  buyCrypto(data: any): Observable<ResponseCryptoFee> {
    return this.http
      .post<ResponseCryptoFee>(
        `${this.cryptoUrl}/init-buy`,
        data,
        this.config
      );
    }

    importCrypto(data: any): Observable<ResponseParent> {
      return this.http.post<ResponseParent>(
        `${this.cryptoUrl}/create-invoice`,
        { ...data, withdraw_fees: 0.001, accept_variations: true },
        this.config
      );
    }
}
