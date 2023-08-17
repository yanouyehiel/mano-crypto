import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url = environment.backend_api_url + environment.auth_url;
  private config = {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      "json" :"application/json"
    },
  };

  constructor(private httpClient: HttpClient) { }

  register(user: any) {
    this.httpClient.post(`${this.url}/register`, user, this.config).subscribe(res => {
      if (res) {
        console.log('Inscription réussi !')
      }
    });
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
