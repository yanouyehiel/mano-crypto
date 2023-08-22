import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientGuard {
  
  constructor(public router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    let user = JSON.parse(localStorage.getItem('user-mansexch') || '{}')
    if (!user || user === null) {
      this.router.navigate(['/auth/login'])
    } else if (user) {
      if (!Object.keys(user).length) {
        this.router.navigate(['/auth/login'])
        return true;
      }
    }
    return true;
  }
};
