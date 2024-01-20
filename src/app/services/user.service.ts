import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ResponseEmail, ResponseProfile, ResponseUser } from '../models/User';
import { Observable } from 'rxjs';
import { TableUser } from '../models/Table';
// import { TableUser } from '../models/Table';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private urlUser = environment.backend_api_url + environment.user_url
  private urlAdmin = environment.backend_api_url + environment.admin_url
  private tokenRegistred: any = localStorage.getItem('token-mansexch') || '{}'
  private data: any = JSON.parse(this.tokenRegistred)
  private tokenReset: any = JSON.parse(localStorage.getItem('tokenReset-mansexch') || '{}')

  private config = {
    headers: new HttpHeaders(
      {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${this.data.token}`
      }
    )
  }
  private simpleAuthHeader = {
    headers: new HttpHeaders(
      {
        'Authorization': `Bearer ${this.data.token}`
      }
    )
  }
  private headReset = {
    headers: new HttpHeaders(
      {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${this.tokenReset}`
      }
    )
  }

  constructor(private http: HttpClient) { }

  getProfile(): Observable<ResponseProfile> {
    return this.http.get<ResponseProfile>(`${this.urlUser}/profile`, this.config)
  }

  updateName(name: string): Observable<ResponseProfile> {
    return this.http.put<ResponseProfile>(`${this.urlUser}/update-profile`, {name: name}, this.config)
  }

  askResetPassword(email: any): Observable<ResponseUser> {
    return this.http.post<ResponseUser>(`${this.urlUser}/ask-reset-password-code`, email, this.config)
  }

  resetPassword(data: any): Observable<ResponseUser> {
    return this.http.put<ResponseUser>(`${this.urlUser}/reset-password`, data, this.headReset)
  }

  submitKyc(data: FormData): Observable<any> {
    return this.http.post<any>(`${this.urlUser}/submit-kyc`, data, this.simpleAuthHeader)
  }
}