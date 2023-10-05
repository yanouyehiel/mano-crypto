import { Component, OnInit } from '@angular/core';
const Swal = require('sweetalert2')

@Component({
  selector: 'app-profile-finance',
  templateUrl: './profile-finance.component.html',
  styleUrls: ['./profile-finance.component.scss']
})
export class ProfileFinanceComponent implements OnInit {
  private alertWelcomeTime: number = 0;
  constructor() {

  }

  ngOnInit(): void {
    this.alertWelcomeTime = 1;
    if (this.alertWelcomeTime !== 1) {
      this.dialog()
    }
  }


  dialog(){
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Bienvenu John Doe sur Mansexch',
      showConfirmButton: false,
      timer: 2000
    })
  }
}
