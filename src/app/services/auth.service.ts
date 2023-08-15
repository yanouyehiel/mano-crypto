import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url = environment.auth_url;
  private config = {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      "json" :"application/json"
    }
  };

  constructor(private httpClient: HttpClient) { }

  register(user: any) {
    this.httpClient.post(`${this.url}/auth/register`, user, this.config).subscribe(res => {
      console.log(res)
    });
  }
}
