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
  private walletUrl = environment.backend_api_url + environment.url_deposit;
  private socket: WebSocket;

  connectToBTC(): Observable<any> {
    this.socket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');

    return new Observable(observer => {
      this.socket.onmessage = (event) => observer.next(JSON.parse(event.data));
      this.socket.onerror = (error) => observer.error(error);
      this.socket.onclose = () => observer.complete();

      return () => this.socket.close();
    });
  }

  connectToETH(): Observable<any> {
    this.socket = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@trade');

    return new Observable(observer => {
      this.socket.onmessage = (event) => observer.next(JSON.parse(event.data));
      this.socket.onerror = (error) => observer.error(error);
      this.socket.onclose = () => observer.complete();

      return () => this.socket.close();
    });
  }

  private getConfig() {
    let tokenRegistred: any = localStorage.getItem('token-mansexch');
    let data: any = JSON.parse(tokenRegistred);
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`,
      }),
    }
  };

  constructor(private http: HttpClient) { }

  getWalletDetails(): Observable<ResponseParent> {
    return this.http.get<ResponseParent>(`${this.walletUrl}/details`, this.getConfig())
  }

  getCryptoFees(data: any): Observable<ResponseParent> {
    return this.http.post<ResponseCryptoFee>(
      `${this.cryptoUrl}/get-crypto-fees`,
      data,
      this.getConfig()
    );
  }

  getMinimumCryptoWithdrawAmount(data: any): Observable<ResponseParent> {
    return this.http.post<ResponseCryptoFee>(
      `${this.cryptoUrl}/get-minimum-withdrawal-amount`,
      data,
      this.getConfig()
    );
  }

  convertToFiat(data: any): Observable<ResponseParent> {
    return this.http.post<ResponseCryptoFee>(
      `${this.cryptoUrl}/convert-crypto-to-fiats`,
      data,
      this.getConfig()
    );
  }

  convertToCrypto(data: any): Observable<ResponseParent> {
    return this.http.post<ResponseCryptoFee>(
      `${this.cryptoUrl}/convert-fiat-to-cryptos`,
      data,
      this.getConfig()
    );
  }

  buyCrypto(data: any): Observable<ResponseCryptoFee> {
    return this.http
      .post<ResponseCryptoFee>(
        `${this.cryptoUrl}/init-buy`,
        data,
        this.getConfig()
      );
  }
  sellCrypto(data: any): Observable<ResponseParent> {
    return this.http
      .post<ResponseCryptoFee>(
        `${this.cryptoUrl}/init-sell`,
        data,
        this.getConfig()
      );
  }

  importCrypto(data: any): Observable<ResponseParent> {
    return this.http.post<ResponseParent>(
      `${this.cryptoUrl}/create-invoice`,
      { ...data, withdraw_fees: 0.001, accept_variations: true },
      this.getConfig()
    );
  }

  outvoice(data: any): Observable<ResponseParent> {
    return this.http.post<ResponseParent>(
      `${this.cryptoUrl}/create-payout`,
      { ...data, withdraw_fees: 0.001, accept_variations: true },
      this.getConfig()
    );
  }

  p2pTransfert(data: any): Observable<ResponseParent> {
    return this.http.post<ResponseParent>(
      `${this.walletUrl}/friend-transfer`,
      data,
      this.getConfig()
    );
  }
}
