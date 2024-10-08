import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataCryptoService } from 'src/app/services/data-crypto.service';

@Component({
  selector: 'app-crypto-balance',
  templateUrl: './crypto-balance.component.html',
  styleUrls: ['./crypto-balance.component.scss'],
})
export class CryptoBalanceComponent implements OnInit {
  wallet: any[];
  response:any;
  user:any
  constructor(private cryptoService: DataCryptoService, private router: Router) {}

  ngOnInit(): void {
    // this.user = JSON.parse(localStorage.getItem('user-mansexch')!).user
    // this.wallet = this.user.wallets.filter((e:any)=>e.image_url!=null);
    this.getWalletDetails()
  }

  getWalletDetails() {
    this.cryptoService.getWalletDetails().subscribe((value) => {    
      this.response = value;
      if (value.statusCode === 1001) {
        this.router.navigate(['/auth/login'])
      } else if(this.response.statusCode==1000){
        this.wallet = this.response.data.details.filter((e:any)=>e.image_url!=null);       
      }
    });
  }
}
