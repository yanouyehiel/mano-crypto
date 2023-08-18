import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ResponseUser, User } from '../models/User';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url = environment.backend_api_url + environment.auth_url;
  private config = {
    headers: new HttpHeaders(
      {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
        "Content-Type": "application/json"
      }
    )
  };

  constructor(private httpClient: HttpClient) { }

  register(user: User): Observable<ResponseUser> {
    
    return this.httpClient.post<ResponseUser>(`${this.url}/register`, user, this.config);

  }

  login(data: any) {
    this.httpClient.post<User>(`${this.url}/login`, data, {observe: 'response'}).subscribe((res) => {
      if (res && res.body) {
        console.log(res.body)
        localStorage.setItem('user-manseckh', JSON.stringify(res.body))
      }
    })
  }
}
