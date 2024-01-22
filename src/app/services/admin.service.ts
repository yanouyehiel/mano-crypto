import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseParent } from '../models/Transaction';


@Injectable({
    providedIn: 'root',
})
export class AdminService {
    private urlDeposit = environment.backend_api_url + environment.url_deposit;
    private urlAdmin = environment.backend_api_url + environment.admin_url;

    private tokenRegistred: any = localStorage.getItem('token-mansexch');
    private data: any = JSON.parse(this.tokenRegistred);

    private config = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.data.token}`,
        }),
    };

    constructor(private http: HttpClient) { }

    getConfigs(): Observable<ResponseParent> {
        return this.http.get<ResponseParent>(
            `${this.urlAdmin}/configs`,
            this.config
        ).pipe(catchError((error) => {
            return of(error.error)
        }));
    }

    setConfigs(body: any): Observable<ResponseParent> {
        return this.http.put<ResponseParent>(
            `${this.urlAdmin}/configs`, body,
            this.config
        ).pipe(catchError((error) => {
            return of(error.error)
        }));
    }

    
  getUsersByCriteria(bodyFilter:any): Observable<any> {
    return this.http.post<any>(`${this.urlAdmin}/users?page=${bodyFilter.page}&limit=25`,bodyFilter.criteria, this.config)
  }

  getUsersTransactions(page:number,id?:string, type?:"WITHDRAW_CRYPTO"|"WITHDRAW", max?:number,status?:string): Observable<any> {
    return this.http.get<any>(id!=null?`${this.urlAdmin}/transactions?userId=${id}&page=${page}&limit=${max?max:9}`:`${this.urlAdmin}/transactions?page=${page}&limit=${max?max:25}&status=${status}&type=${type}`, this.config)
  }

  getUsersStatistics(country:string): Observable<any> {
    return this.http.get<any>(`${this.urlAdmin}/statistics${(country.toLowerCase()!='all')?'?country='+country:''}`, this.config)
  }

    banAnUser(uid: string, action: "active" | "banned" | "suspended"): Observable<ResponseParent> {
        return this.http.put<ResponseParent>(
            `${this.urlAdmin}/ban?userId=${uid}&action=${action}`,{},
            this.config
        ).pipe(catchError((error) => {
            return of(error.error)
        }));
    }

    manageWithdrawStatus(transaction_id: string, action: "approved" | "rejected",body:any): Observable<ResponseParent> {
        return this.http.put<ResponseParent>(
            `${this.urlAdmin}/withdraw?transaction_id=${transaction_id}&action=${action}`,body,
            this.config
        ).pipe(catchError((error) => {
            return of(error.error)
        }));
    }

    verifyCryptoWithdraw(reference: string): Observable<ResponseParent> {
        return this.http.post<ResponseParent>(
            `${this.urlAdmin}/withdraw-crypto/verify?reference=${reference}`,{},
            this.config
        ).pipe(catchError((error) => {
            return of(error.error)
        }));
    }

    roleOfUser(uid: string, role: "validator" | "customer" | "admin"): Observable<ResponseParent> {
        return this.http.put<ResponseParent>(
            `${this.urlAdmin}/role?user_id=${uid}&role=${role}`,{},
            this.config
        ).pipe(catchError((error) => {
            return of(error.error)
        }));
    }

    kyc(uid: string, action: "approved" | "rejected", document_type: string, reason?:string): Observable<ResponseParent> {
        return this.http.put<ResponseParent>(
            `${this.urlAdmin}/kyc?userId=${uid}&action=${action}&document_type=${document_type}`,reason?{reject_reason:reason}:{},
            this.config
        ).pipe(catchError((error) => {
            return of(error.error)
        }));
    }
    getCountries(): Observable<ResponseParent> {
        return this.http.get<ResponseParent>(
            `${this.urlAdmin}/countries`,
            this.config
        ).pipe(catchError((error) => {
            return of(error.error)
        }));
    }


}
