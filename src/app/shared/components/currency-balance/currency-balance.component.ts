import { Component } from '@angular/core';

@Component({
  selector: 'app-currency-balance',
  templateUrl: './currency-balance.component.html',
  styleUrls: ['./currency-balance.component.scss']
})
export class CurrencyBalanceComponent {
  public earningData = [
    {
      id: 1,
      classCompo: 'bg-primary',
      icon: 'database',
      title: 'Fcfa XAF',
      count: '9000'
    },
    {
      id: 2,
      classCompo: 'bg-success',
      icon: 'shopping-bag',
      title: 'USDT USA',
      count: '40'
    }
  ];


}
