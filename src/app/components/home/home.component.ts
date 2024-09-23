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
  //public loader: boolean = true;
  private userSaved = localStorage.getItem('user-mansexch')
  public earningData = [
    {
      id: 1,
      classCompo: 'bg-primary',
      icon: 'trending-up',
      title: 'Cliquez ici pour',
      count: 'Acheter',
      link: "/client/acheter-crypto"
    },
    {
      id: 2,
      classCompo: 'bg-secondary',
      icon: 'trending-down',
      title: 'Cliquez ici pour',
      count: 'Vendre',
      link: "/client/vente-crypto"
    },
    {
      id: 3,
      classCompo: 'bg-success',
      icon: 'chevrons-left',
      title: 'Cliquez ici pour',
      count: 'Transférer',
      link: "/client/transferer-crypto"
    },
    {
      id: 4,
      classCompo: 'bg-warning',
      icon: 'repeat',
      title: 'Cliquez ici pour',
      count: 'Partager',
      link: "/client/share-to-friend"
    },
  ];
  private intervalId: any;

  constructor(private router: Router, private cryptoService: DataCryptoService) {
    if (this.userSaved == null) {
      this.router.navigate(['/auth/login'])
    }
  }

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.getWalletDetails()
    }, 3000);
  }

  getWalletDetails() {
    //this.loader = true;
    this.cryptoService.getWalletDetails().subscribe((response: any) => {
      console.log(response.data)
      this.walletData = response.data.details
      //this.loader = false;
    }, (err) => {
      if (err.status === 401) {
        this.router.navigate(['/auth/login'])
      }
    })
  }

  joinService(url: string) {
    this.router.navigate([url])
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
