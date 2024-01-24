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



  private getConfig() {
    let tokenRegistred: any = localStorage.getItem('token-mansexch') || '{}'
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
  private getSimpleAuthHeader() {
    let tokenRegistred: any = localStorage.getItem('token-mansexch') || '{}'
    let data: any = JSON.parse(tokenRegistred)
    return {
      headers: new HttpHeaders(
        {
          'Authorization': `Bearer ${data.token}`
        }
      )
    }
  }

  private getHeadReset() {
    let tokenReset: any = JSON.parse(localStorage.getItem('tokenReset-mansexch') || '{}')
    return {
      headers: new HttpHeaders(
        {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${tokenReset}`
        }
      )
    }
  }



  constructor(private http: HttpClient) { }

  getProfile(): Observable<ResponseProfile> {
    return this.http.get<ResponseProfile>(`${this.urlUser}/profile`, this.getConfig())
  }

  updateName(name: string): Observable<ResponseProfile> {
    return this.http.put<ResponseProfile>(`${this.urlUser}/update-profile`, { name: name }, this.getConfig())
  }

  askResetPassword(email: any): Observable<ResponseUser> {
    return this.http.post<ResponseUser>(`${this.urlUser}/ask-reset-password-code`, email, this.getConfig())
  }

  resetPassword(data: any): Observable<ResponseUser> {
    return this.http.put<ResponseUser>(`${this.urlUser}/reset-password`, data, this.getHeadReset())
  }

  submitKyc(data: FormData): Observable<any> {
    return this.http.post<any>(`${this.urlUser}/submit-kyc`, data, this.getSimpleAuthHeader())
  }
}