import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  private userSaved = JSON.parse(localStorage.getItem('user-mansexch') || '{}')

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (!this.userSaved) {
      this.router.navigate(['/auth/login'])
    }
  }
}
