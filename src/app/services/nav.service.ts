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
      headTitle1: 'Home',
      headTitle2: 'Dashboard & Tools'
    },
    {
      title: 'Dashboard',
      icon: 'home',
      type: 'sub',
      badgeType: 'success',
      badgeValue: '2',
      active: true,
      children: [
        {
          path: '/dashboard/profile', 
          title: 'Profile', 
          type: 'link'
        },
        {
          path: '/dashboard/profile', 
          title: 'Profile', 
          type: 'link'
        }
      ]
    }
  ]

  items = new BehaviorSubject<Menu[]>(this.MENUITEMS);
}
