import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.scss']
})
export class OperationsComponent {
  private userSaved = localStorage.getItem('user-mansexch')
  
  constructor(private router: Router) {
    if (this.userSaved == undefined) {
      this.router.navigate(['/auth/login'])
    }
  }
}
