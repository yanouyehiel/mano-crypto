import { Component, OnInit } from '@angular/core';
import * as chartData from '../../../shared/data/chartData'
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CryptoTransactionService } from 'src/app/services/crypto-transaction.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-variation-crypto',
  templateUrl: './variation-crypto.component.html',
  styleUrls: ['./variation-crypto.component.scss']
})
export class VariationCryptoComponent implements OnInit {

  prices: any[] = [];
  previousBtcPrice: any;
  latestBtcPrice: any;
  previousEthPrice: any;
  latestEthPrice: any;
  public btcChart = {
    lineChartData: [{
      data: [], fill: false,
      borderWidth: 1,
      pointRadius: 0, label: 'Bitcoin(USDT)', borderColor: '#F7931A',
    },],
    lineChartLabels: [],
    lineChartOptions: { responsive: true },
    lineChartLegend: true,
  }
  public ethChart = {
    lineChartData: [{
      data: [],
      fill: false,
      borderWidth: 1,
      pointRadius: 0,
      label: `Ethereum(USDT)`,
      borderColor: '#8585ff'
    }],
    lineChartLabels: [],
    lineChartOptions: { responsive: true },
    lineChartLegend: true,
  }

  dateStart: any;
  dateEnd: any;

  activatedEthVariation: number
  activatedBtcVariation: number



  constructor(private http: HttpClient, private transactionService: CryptoTransactionService, private modalService: NgbModal) { }

  ngOnInit() {
    this.setBtcVariationDuration(7)
    this.setEthVariationDuration(7)
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
    let url = ''
    if ([1, 7, 30].includes(this.activatedBtcVariation)) {
      url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${this.activatedBtcVariation.toString()}`;
    } else {
      let stampNow = new Date().getTime()
      // if(this.dateStart && this.dateStart < stampNow){
      //   if(this.dateEnd && this.dateEnd < stampNow){

      //   }
      url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=${this.dateStart}&to=${this.dateEnd}`
      // }
    }
    return this.http.get(url);
  }
  getEthereumPriceData(): Observable<any> {
    let url = ''
    if ([1, 7, 30].includes(this.activatedEthVariation)) {
      url = `https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=${this.activatedBtcVariation.toString()}`;
    } else {
      let stampNow = new Date().getTime()
      // if(this.dateStart && this.dateStart < stampNow){
      //   if(this.dateEnd && this.dateEnd < stampNow){

      //   }else{
      url = `https://api.coingecko.com/api/v3/coins/ethereum/market_chart/range?vs_currency=usd&from=${this.dateStart}&to=${this.dateEnd}`
      //   }

      // }

    }
    return this.http.get(url);
  }
  onResize() {
    this.btcChart.lineChartData[0].borderWidth = window.innerWidth > 850 ? 2 : 1;
    this.ethChart.lineChartData[0].borderWidth = window.innerWidth > 850 ? 2 : 1;
  }

  buildBtcChart() {
    this.getBitcoinPriceData().subscribe((dataBtc: any) => {
      const btcPrices = dataBtc.prices;
      this.btcChart.lineChartData[0].data = btcPrices.map((priceData: any) => priceData[1]);

      if (this.activatedBtcVariation == 1) {
        this.btcChart.lineChartLabels = btcPrices.map((priceData: any) => new Date(priceData[0]).toLocaleTimeString('fr-FR'));
      } else if (this.activatedBtcVariation == 30) {
        this.btcChart.lineChartLabels = btcPrices.map((priceData: any) => new Date(priceData[0]).toLocaleDateString('fr-FR'));
      } else {
        this.btcChart.lineChartLabels = btcPrices.map((priceData: any) => new Date(priceData[0]).toLocaleString('fr-FR'));
      }
    });
  }

  buildEthChart() {
    this.getEthereumPriceData().subscribe((dataEth: any) => {
      // Traitement des données reçues depuis l'API

      const ethPrices = dataEth.prices;


      this.ethChart.lineChartData[0].data = ethPrices.map((priceData: any) => priceData[1]);
      if (this.activatedEthVariation == 1) {
        this.ethChart.lineChartLabels = ethPrices.map((priceData: any) => new Date(priceData[0]).toLocaleTimeString('fr-FR'));
      } else if (this.activatedEthVariation == 30) {
        this.ethChart.lineChartLabels = ethPrices.map((priceData: any) => new Date(priceData[0]).toLocaleDateString('fr-FR'));
      } else {
        this.ethChart.lineChartLabels = ethPrices.map((priceData: any) => new Date(priceData[0]).toLocaleString('fr-FR'));
      }
    });
  }

  setBtcVariationDuration(days: number) {
    this.activatedBtcVariation = days;
    this.buildBtcChart()
  }
  setEthVariationDuration(days: number) {
    this.activatedEthVariation = days;
    this.buildEthChart()
  }

  openMdoModal(modContent: any) {
    const modalRef = this.modalService.open(modContent);
  }

  getCustomizedDateTime(startDate: string, endDate: string, crypto: string) {

    this.dateStart = (new Date(startDate).getTime())/1000
    this.dateEnd = (new Date(endDate).getTime())/1000
    if (crypto == 'BTC') {
      this.activatedBtcVariation = 0;
      this.buildBtcChart()
    } else {
      this.activatedEthVariation = 0;
      this.buildEthChart()
    }
    this.modalService.dismissAll();
  }
}