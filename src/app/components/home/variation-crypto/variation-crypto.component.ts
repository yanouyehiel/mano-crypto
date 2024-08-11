import { Component, OnInit } from '@angular/core';
import * as chartData from '../../../shared/data/chartData'
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CryptoTransactionService } from 'src/app/services/crypto-transaction.service';

@Component({
  selector: 'app-variation-crypto',
  templateUrl: './variation-crypto.component.html',
  styleUrls: ['./variation-crypto.component.scss']
})
export class VariationCryptoComponent implements OnInit {

  prices: any[] = [];
  previousBtcPrice: any;
  latestBtcPrice:any;
  previousEthPrice: any;
  latestEthPrice:any;
  public btcChart = {
    lineChartData: [{ data: [],fill: false,
      borderWidth: 1,
      pointRadius: 0, label: 'Bitcoin(USD)',borderColor: '#F7931A',},],
  lineChartLabels: [],
  lineChartOptions: { responsive: true },
  lineChartLegend : true,
  }
  public ethChart = {
    lineChartData: [{ 
      data: [], 
          fill: false,
          borderWidth: 1,
          pointRadius: 0,
          label: `Ethereum(USD)`,
          borderColor: '#8585ff'}],
  lineChartLabels: [],
  lineChartOptions: { responsive: true },
  lineChartLegend : true,
  }



  constructor(private http: HttpClient, private transactionService:CryptoTransactionService) { }

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
  window.addEventListener('resize', this.onResize.bind(this));
  this.onResize()


  this.transactionService.connectToBTC().subscribe(data => {
    const price = parseFloat(data.p).toFixed(2);
    this.previousBtcPrice = this.latestBtcPrice;
    this.latestBtcPrice = price;
  });
  this.transactionService.connectToETH().subscribe(data => {
    const price = parseFloat(data.p).toFixed(2);
    this.previousEthPrice = this.latestEthPrice;
    this.latestEthPrice = price;
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
  onResize(){
    this.btcChart.lineChartData[0].borderWidth = window.innerWidth>850 ?2:1;
    this.ethChart.lineChartData[0].borderWidth =  window.innerWidth>850 ?2:1;
  }
}