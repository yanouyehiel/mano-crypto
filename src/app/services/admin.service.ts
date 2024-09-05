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



    private getConfig() {
        let tokenRegistred: any = localStorage.getItem('token-mansexch') || '{}';
        let data: any = JSON.parse(tokenRegistred);
        return {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: `Bearer ${data.token}`,
            }),
        }
    };

    constructor(private http: HttpClient) { }

    getConfigs(): Observable<ResponseParent> {
        return this.http.get<ResponseParent>(
            `${this.urlAdmin}/configs`,
            this.getConfig()
        ).pipe(catchError((error) => {
            return of(error.error)
        }));
    }

    setConfigs(body: any): Observable<ResponseParent> {
        return this.http.put<ResponseParent>(
            `${this.urlAdmin}/configs`, body,
            this.getConfig()
        ).pipe(catchError((error) => {
            return of(error.error)
        }));
    }

    formatWithSeparator(value: number | string): string {
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
      
        if (isNaN(numericValue)) {
          return '';
        }
      
        const numStr = numericValue.toString();
    
        let result = '';
        let counter = 0;
      
        for (let i = numStr.length - 1; i >= 0; i--) {
          result = numStr[i] + result;
      
          counter++;
          if (counter === 3 && i > 0) {
            result = ' ' + result;
            counter = 1;
          }
        }
      
        return result;
    }


    getUsersByCriteria(bodyFilter: any): Observable<any> {
        return this.http.post<any>(`${this.urlAdmin}/users?page=${bodyFilter.page}&limit=25`, bodyFilter.criteria, this.getConfig())
    }

    getUsersTransactions(page: number, id?: string, type?: "WITHDRAW_CRYPTO" | "WITHDRAW", max?: number, status?: string): Observable<any> {
        return this.http.get<any>(id != null ? `${this.urlAdmin}/transactions?userId=${id}&page=${page}&limit=${max ? max : 9}` : `${this.urlAdmin}/transactions?page=${page}&limit=${max ? max : 25}&status=${status}&type=${type}`, this.getConfig())
    }

    getAllUsersTransactions(page: number): Observable<any> {
        return this.http.get<any>(`${this.urlAdmin}/transactions?page=${page}`, this.getConfig())
    }

    getUsersStatistics(country: string): Observable<any> {
        if (country === "" || country === "Tous les pays") {
            return this.http.get<any>(`${this.urlAdmin}/statistics`, this.getConfig())
        }
        return this.http.get<any>(`${this.urlAdmin}/statistics${'?country=' + country}`, this.getConfig())
    }

    banAnUser(uid: string, action: "active" | "banned" | "suspended"): Observable<ResponseParent> {
        return this.http.put<ResponseParent>(
            `${this.urlAdmin}/ban?userId=${uid}&action=${action}`, {},
            this.getConfig()
        ).pipe(catchError((error) => {
            return of(error.error)
        }));
    }

    manageWithdrawStatus(transaction_id: string, action: "approved" | "rejected", body: any): Observable<ResponseParent> {
        return this.http.put<ResponseParent>(
            `${this.urlAdmin}/withdraw?transaction_id=${transaction_id}&action=${action}`, body,
            this.getConfig()
        ).pipe(catchError((error) => {
            return of(error.error)
        }));
    }

    verifyCryptoWithdraw(reference: string): Observable<ResponseParent> {
        return this.http.post<ResponseParent>(
            `${this.urlAdmin}/withdraw-crypto/verify?reference=${reference}`, {},
            this.getConfig()
        ).pipe(catchError((error) => {
            return of(error.error)
        }));
    }

    roleOfUser(uid: string, role: "validator" | "customer" | "admin"): Observable<ResponseParent> {
        return this.http.put<ResponseParent>(
            `${this.urlAdmin}/role?user_id=${uid}&role=${role}`, {},
            this.getConfig()
        ).pipe(catchError((error) => {
            return of(error.error)
        }));
    }

    kyc(uid: string, action: "approved" | "rejected", document_type: string, reason?: string): Observable<ResponseParent> {
        return this.http.put<ResponseParent>(
            `${this.urlAdmin}/kyc?userId=${uid}&action=${action}&document_type=${document_type}`, reason ? { reject_reason: reason } : {},
            this.getConfig()
        ).pipe(catchError((error) => {
            return of(error.error)
        }));
    }
    getCountries(): Observable<ResponseParent> {
        return this.http.get<ResponseParent>(
            `${this.urlAdmin}/countries`,
            this.getConfig()
        ).pipe(catchError((error) => {
            return of(error.error)
        }));
    }


}
