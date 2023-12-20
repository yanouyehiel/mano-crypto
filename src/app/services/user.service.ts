import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ResponseProfile, ResponseUser } from '../models/User';
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

  askResetPassword(email: any): Observable<ResponseUser> {
    return this.http.post<ResponseUser>(`${this.urlUser}/ask-reset-password-code`, email)
  }

  resetPassword(data: any): Observable<ResponseUser> {
    return this.http.put<ResponseUser>(`${this.urlUser}/reset-password`, data, this.headReset)
  }

  getUsersByCriteria(criteria:any): Observable<any> {
    return this.http.post<any>(`${this.urlAdmin}/users`,criteria, this.config)
  }

  getUsersTransactions(id?:string): Observable<any> {
    return this.http.get<any>(id!=null?`${this.urlAdmin}/transactions?userId=${id}`:`${this.urlAdmin}/transactions`, this.config)
  }

  getUsersStatistics(country:string): Observable<any> {
    return this.http.get<any>(`${this.urlAdmin}/statistics${(country.toLowerCase()!='all')?'?country='+country:''}`, this.config)
  }

  submitKyc(data: any): Observable<any> {
    return this.http.post<any>(`${this.urlUser}/submit-kyc`, data, this.config)
  }
}
