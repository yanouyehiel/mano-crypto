import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataCryptoService } from 'src/app/services/data-crypto.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public walletData: any;
  public loader: boolean = true;
  private userSaved = localStorage.getItem('user-mansexch')

  constructor(private router: Router, private cryptoService: DataCryptoService) {
    if (this.userSaved == null) {
      this.router.navigate(['/auth/login'])
    }
  }

  ngOnInit(): void {
    this.getWalletDetails()
  }

  getWalletDetails() {
    this.loader = true;
    this.cryptoService.getWalletDetails().subscribe((response: any) => {
      this.walletData = response.data.details
      this.loader = false;
    }, (err) => {
      if (err.status === 401) {
        this.router.navigate(['/auth/login'])
      }
    })
  }
}
