import { Component, OnInit } from '@angular/core';
import * as chartData from '../../../shared/data/chartData'
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-variation-crypto',
  templateUrl: './variation-crypto.component.html',
  styleUrls: ['./variation-crypto.component.scss']
})
export class VariationCryptoComponent implements OnInit {
  public btcChart = {
    lineChartData: [{ data: [], label: 'Bitcoin',borderColor: '#F7931A',},],
  lineChartLabels: [],
  lineChartOptions: { responsive: true },
  lineChartLegend : true,
  }
  public ethChart = {
    lineChartData: [{ data: [], label: 'Ethereum',borderColor: '#8585ff'}],
  lineChartLabels: [],
  lineChartOptions: { responsive: true },
  lineChartLegend : true,
  }

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getBitcoinPriceData().subscribe((dataBtc: any) => {
      const btcPrices = dataBtc.prices;
      this.btcChart.lineChartData[0].data = btcPrices.map((priceData: any) => priceData[1]);
      this.btcChart.lineChartLabels = btcPrices.map((priceData: any) => new Date(priceData[0]).toLocaleDateString('fr-FR'));
  });
  this.getEthereumPriceData().subscribe((dataEth: any) => {
    // Traitement des données reçues depuis l'API
    
    const ethPrices = dataEth.prices;

   
    this.ethChart.lineChartData[0].data = ethPrices.map((priceData: any) => priceData[1]);
    this.ethChart.lineChartLabels = ethPrices.map((priceData: any) => new Date(priceData[0]).toLocaleDateString('fr-FR'));
  });
  }

  getBitcoinPriceData(): Observable<any> {
    const url = 'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30';
    return this.http.get(url);
  }
  getEthereumPriceData(): Observable<any> {
    const url = 'https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=30';
    return this.http.get(url);
  }
}