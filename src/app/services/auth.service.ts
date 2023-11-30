import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ResponseEmail, ResponseUser, User } from '../models/User';
import { Observable } from 'rxjs';
import { ResponseParent } from '../models/Transaction';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url = environment.backend_api_url + environment.auth_url;
  private tokenRegistred: any = localStorage.getItem('token-mansexch') ? localStorage.getItem('token-mansexch') : '{}'
  private data: any = JSON.parse(this.tokenRegistred)
  private config = {
    headers: new HttpHeaders(
      {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
        "Content-Type": "application/json"
      }
    )
  };
  private configAuthorized = {
    headers: new HttpHeaders(
      {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
        "Content-Type": "application/json",
        'Authorization': `Bearer ${this.data.token}`
      }
    )
  }

  constructor(private httpClient: HttpClient) { }

  register(user: User): Observable<ResponseUser> {
    return this.httpClient.post<ResponseUser>(`${this.url}/register`, user, this.config);
  }

  login(data: any) {
    return this.httpClient.post<ResponseUser>(`${this.url}/login`, data, this.config);
  }

  sendEmailCode(data: any): Observable<ResponseEmail> {
    return this.httpClient.post<ResponseEmail>(`${this.url}/send-email-code`, data, this.configAuthorized);
  }

  verifyUser(data: any): Observable<ResponseEmail> {
    return this.httpClient.post<ResponseEmail>(`${this.url}/verify-user`, data, this.configAuthorized);
  }

  sendOtp():Observable<ResponseParent>{
    return this.httpClient.post<ResponseParent>(`${this.url}/send-email-code`,{}, this.configAuthorized);
  }

  logout(): void {
    localStorage.removeItem('user-mansexch')
    localStorage.removeItem('token-mansexch')
  }
}
