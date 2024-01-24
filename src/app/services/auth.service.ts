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


  private getConfig() {
    return {
      headers: new HttpHeaders(
        {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          "Content-Type": "application/json"
        }
      )
    }
  };
  private getConfigAuthorized() {
    let tokenRegistred: any = localStorage.getItem('token-mansexch') || '{}'
    let data: any = JSON.parse(tokenRegistred)
    return {
      headers: new HttpHeaders(
        {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          "Content-Type": "application/json",
          'Authorization': `Bearer ${data.token}`
        }
      )
    }
  }

  constructor(private httpClient: HttpClient) { }

  register(user: User): Observable<ResponseUser> {
    return this.httpClient.post<ResponseUser>(`${this.url}/register`, user);
  }

  login(data: any) {
    return this.httpClient.post<ResponseUser>(`${this.url}/login`, data, this.getConfig());
  }

  sendEmailCode(data: any): Observable<ResponseEmail> {
    return this.httpClient.post<ResponseEmail>(`${this.url}/send-email-code`, data, this.getConfigAuthorized());
  }

  verifyUser(data: any): Observable<ResponseEmail> {
    return this.httpClient.post<ResponseEmail>(`${this.url}/verify-user`, data, this.getConfigAuthorized());
  }

  sendOtp(): Observable<ResponseParent> {
    return this.httpClient.post<ResponseParent>(`${this.url}/send-email-code`, {}, this.getConfigAuthorized());
  }

  logout(): Observable<ResponseUser> {
    return this.httpClient.get<ResponseUser>(`${this.url}/logout`, this.getConfigAuthorized())
  }
}
