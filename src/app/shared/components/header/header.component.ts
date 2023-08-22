import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  collapseSidebar: boolean = true;
  constructor(private authService: AuthService, private router: Router) {}
  open = false;

  ngOnInit(): void {
    
  }

  openMenu() {
    this.open = !this.open
  }

  languageToggle() {}

  sidebarToggle() {}
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login'])
  }
}
