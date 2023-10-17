import { Component } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-taux-de-change',
  templateUrl: './taux-de-change.component.html',
  styleUrls: ['./taux-de-change.component.scss']
})
export class TauxDeChangeComponent {
  constructor() {}
  public recentOrders: any[] = [];
  public loader: boolean = true;

  public currentValues = [
    {
      type: 'BTC',
      value: 12.63,
      actuelValue: 39485000,
      class: 'primary',
      icon: 'bitcoin-btc-logo.svg',
    },
    {
      type: 'ETH',
      value: 4.63,
      actuelValue: 22251,
      class: 'secondary',
      icon: 'ethereum-eth-logo.svg',
    },
    {
      type: 'USD',
      value: 54.6,
      actuelValue: 39485,
      class: 'primary',
      icon: 'usd-svg.svg',
    },
  ];

  crypto = {
    symbol:"ETH",
    name:"Etherium",
    value:29000,
    daily:2.9,
    weekly:-4.5
  }

  findCrypto(){

  }

  success(): void {
    Swal.fire('Transfert initié !');
  }
  phoneNotActive(): void {
    Swal.fire('Erreur', "Ce numero de telephone n'est pas activé?", 'error');
  }
  error(): void {
    Swal.fire('Erreur', 'Vous ne pouvez pas faire ce retrait ?', 'error');
  }
}
