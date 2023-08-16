import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-validation',
  templateUrl: './validation.component.html',
  styleUrls: ['./validation.component.scss']
})
export class ValidationComponent implements OnInit {
  public show: boolean = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }
  showPassword() {
    this.show = !this.show;
  }

  goToConnect() {
    this.router.navigate(['/pages/login'])
  }
  
}
