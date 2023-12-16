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
        // this.megaMenu = false;
        // this.levelMenu = false;
      });
    }
  }

  changeUrl(val: string): void {
    this.url.next(val);
  }

  private setScreenWidth(width: number): void {
    this.screenWidth.next(width);
  }

  MENUITEMS: Menu[] = [
    {
      headTitle1: 'Client'
    },
    {
      title: 'Dashboard',
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
      path: '/client/add-crypto',
      title: 'Acheter de la crypto',
      type: 'link',
      icon: 'trending-up',
      badgeType: 'success',
      active: false
    },
    {
      path: '/client/retirer-crypto',
      title: 'Retirer de la crypto',
      type: 'link',
      icon: 'chevrons-left',
      badgeType: 'success',
      active: false
    },
    // {
    //   path: '/client/taux-change',
    //   title: 'Consulter le taux de change',
    //   type: 'link',
    //   icon: 'dollar-sign',
    //   badgeType: 'success',
    //   active: false
    // },
    // {
    //   path: '/client/convertir-crypto',
    //   title: 'Convertir la crypto',
    //   type: 'link',
    //   icon: 'repeat',
    //   badgeType: 'success',
    //   active: false
    // },
    {
      path: '/client/retrait-fonds',
      title: 'Retirer des fonds',
      type: 'link',
      icon: 'credit-card',
      badgeType: 'success',
      active: false
    }
  ]

  /*{
      path: '/client/vendre-crypto',
      title: 'Vendre de la crypto',
      type: 'link',
      icon: 'trending-down',
      badgeType: 'success',
      active: false
    },*/

  MENUITEMSADMIN: Menu[] = [
    {
      headTitle1: 'Administration'
    },
    {
      title: 'Dashboard',
      icon: 'home',
      type: 'link',
      active: true,
      path: '/admin/home'
    },
    {
      title: 'Comptes',
      icon: 'user',
      type: 'link',
      active: false,
      path: '/admin/users'
    },
    {
      title: 'Opérations',
      icon: 'repeat',
      type: 'link',
      active: false,
      path: '/admin/operations'
    }
  ]

  items = new BehaviorSubject<Menu[]>(this.MENUITEMS);
  itemsAdmin = new BehaviorSubject<Menu[]>(this.MENUITEMSADMIN);
}
