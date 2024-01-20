import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { Menu } from '../models/Menu';

@Injectable({
  providedIn: 'root'
})
export class NavService {
  private unsubscriber: Subject<any> = new Subject();
  public screenWidth: BehaviorSubject<number> = new BehaviorSubject(
    window.innerWidth
  );
  private url = new BehaviorSubject('default message');
  currentUrl = this.url.asObservable();

  fullScreen: any;

  // Language
  public language: boolean = false;

  // Collapse Sidebar
  public collapseSidebar: boolean = window.innerWidth < 991 ? true : false;

  // For Horizontal Layout Mobile
  public horizontal: boolean = window.innerWidth < 991 ? false : true;

  // Search Box
  public search: boolean = false;

  constructor(private router: Router) {
    this.setItems()
    this.setScreenWidth(window.innerWidth);
    fromEvent(window, 'resize')
      .pipe(debounceTime(1000), takeUntil(this.unsubscriber))
      .subscribe((evt: any) => {
        this.setScreenWidth(evt.target.innerWidth);
        if (evt.target.innerWidth < 991) {
          this.collapseSidebar = true;
          // this.megaMenu = false;
          // this.levelMenu = false;
        }
        if (evt.target.innerWidth < 1199) {
          // this.megaMenuColapse = true;
        }
      });
    if (window.innerWidth < 991) {
      // Detect Route change sidebar close
      this.router.events.subscribe((event) => {
        this.collapseSidebar = true;
      });
    }
  }

  changeUrl(val: string): void {
    this.url.next(val);
  }

  private setScreenWidth(width: number): void {
    this.screenWidth.next(width);
  }
  private getRole() {
    try {
      let userLocal = JSON.parse(localStorage.getItem('user-mansexch')!).user
      console.log(userLocal.role != 'customer')
      return userLocal.role
    } catch (error) {
      return ''
    }
  }

  MENUITEMS: Menu[] = []

  getMenuItems() {
    let role = this.getRole()
    this.MENUITEMS = [

      {
        headTitle1: 'Administration',
        isHidden: role == 'customer'
      },
      {
        title: 'Dashboard',
        icon: 'monitor',
        type: 'link',
        active: true,
        isHidden: role != 'admin',
        path: '/admin/home'
      },
      {
        title: 'Comptes',
        icon: 'users',
        type: 'link',
        active: false,
        isHidden: role == 'customer',
        path: '/admin/users'
      },
      {
        title: 'Opérations',
        icon: 'activity',
        type: 'link',
        active: false,
        isHidden: role == 'customer',
        path: '/admin/operations'
      },
      {
        headTitle1: 'Client'
      },
      {
        title: 'Accueil',
        icon: 'home',
        type: 'link',
        active: true,
        path: '/client/home'
      },
      {
        title: 'Mon Profile',
        icon: 'user',
        type: 'link',
        active: false,
        path: '/client/profile'
      },
      {
        title: 'Mon Historique',
        icon: 'clock',
        type: 'link',
        active: false,
        path: '/client/my-listing'
      },
      {
        headTitle1: 'Finance'
      },
      {
        path: '/client/recharge-compte',
        title: 'Recharger le compte',
        type: 'link',
        icon: 'shopping-cart',
        badgeType: 'success',
        active: false,
      },
      {
        path: '/client/recharge-crypto',
        title: 'Recharger une crypto',
        type: 'link',
        icon: 'maximize',
        badgeType: 'success',
        active: false,
      },
      {
        path: '/client/acheter-crypto',
        title: 'Acheter de la crypto',
        type: 'link',
        icon: 'trending-up',
        badgeType: 'success',
        active: false
      },
      {
        path: '/client/vente-crypto',
        title: 'Vendre de la crypto',
        type: 'link',
        icon: 'trending-down',
        badgeType: 'success',
        active: false
      },
      {
        path: '/client/retirer-crypto',
        title: 'Transférer de la crypto',
        type: 'link',
        icon: 'chevrons-left',
        badgeType: 'success',
        active: false
      },
      {
        path: '/client/retrait-fonds',
        title: 'Retirer des fonds',
        type: 'link',
        icon: 'credit-card',
        badgeType: 'success',
        active: false
      }
    ]
  }

  public items: BehaviorSubject<Menu[]>
  setItems() {
    this.getMenuItems()
    this.items = new BehaviorSubject<Menu[]>(this.MENUITEMS);
    return true
  }

  // itemsAdmin = new BehaviorSubject<Menu[]>(this.MENUITEMSADMIN);
}
