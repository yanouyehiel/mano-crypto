import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  private userSaved = JSON.parse(localStorage.getItem('token-mansexch') || '{}')

  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log(this.userSaved)
    if (!this.userSaved) {
      this.router.navigate(['/auth/login'])
    }
  }
}
