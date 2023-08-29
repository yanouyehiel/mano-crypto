import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ResponseProfile, ResponseUser } from '../models/User';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  private url = environment.backend_api_url + environment.user_url
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

  getProfile(): Observable<ResponseProfile> {
    return this.http.get<ResponseProfile>(`${this.url}/profile`, this.config)
  }
}
