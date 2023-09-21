import { Component, OnInit } from '@angular/core';
import * as chartData from '../../../shared/data/chartData'

@Component({
  selector: 'app-variation-crypto',
  templateUrl: './variation-crypto.component.html',
  styleUrls: ['./variation-crypto.component.scss']
})
export class VariationCryptoComponent implements OnInit {

  constructor() {}

  //public sales = chartData.sales;
  public areaSpalineChart = chartData.areaSpalineChart

  ngOnInit(): void {
    
  }
}
