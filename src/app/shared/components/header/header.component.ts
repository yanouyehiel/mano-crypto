import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { error } from 'console';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { NavService } from 'src/app/services/nav.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  collapseSidebar: boolean = true;
  constructor(
    private authService: AuthService, 
    private router: Router, 
    private navServices: NavService,
    private toast: ToastrService) {}

  open = false;

  ngOnInit(): void {
    
  }

  openMenu() {
    this.open = !this.open
  }

  languageToggle() {
    this.navServices.language = !this.navServices.language;
  }

  sidebarToggle() {
    this.navServices.collapseSidebar = !this.navServices.collapseSidebar;
  }
  
   logout() {
    this.authService.logout().subscribe((res: any) => {
      if (res.statusCode === 1000) {
        localStorage.removeItem('user-mansexch')
        localStorage.removeItem('tokenRegistred')
        this.router.navigate(['/auth/login'])
      }
    }, (error) => {
      this.toast.error(error.error.message)
    });
  }
}
