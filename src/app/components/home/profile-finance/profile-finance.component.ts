import { Component, OnInit } from '@angular/core';
import { ResponseParent } from 'src/app/models/Transaction';
import { DataCryptoService } from 'src/app/services/data-crypto.service';
const Swal = require('sweetalert2')

@Component({
  selector: 'app-profile-finance',
  templateUrl: './profile-finance.component.html',
  styleUrls: ['./profile-finance.component.scss']
})
export class ProfileFinanceComponent implements OnInit {
  private alertWelcomeTime: number = 0;
  public walletData: any;

  constructor(private cryptoService: DataCryptoService) {

  }

  ngOnInit(): void {
    this.alertWelcomeTime = 1;
    if (this.alertWelcomeTime !== 1) {
      this.dialog()
    }
    this.getWalletDetails()
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

  getWalletDetails() {
    this.cryptoService.getWalletDetails().subscribe((response: any) => {
      this.walletData = response.data.details
    })
  }
  displaySolde(solde:any){
    console.log(solde)
   return parseInt(solde)
  }

  truncateNumber(num: number, numDigits: number = 4): number {
    const factor = Math.pow(10, numDigits);
    return Math.trunc(num * factor) / factor;
  }
}
