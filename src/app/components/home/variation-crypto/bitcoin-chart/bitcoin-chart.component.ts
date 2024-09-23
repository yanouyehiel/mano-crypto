import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ChangeDetectorRef } from '@angular/core';
import { CryptoTransactionService } from 'src/app/services/crypto-transaction.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-bitcoin-chart',
  templateUrl: './bitcoin-chart.component.html'
})
export class BitcoinChartComponent implements OnInit {

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  requestParams = { symbol: 'BTCUSDT', interval: '1s', limit: '2000', byRange: false, startTime: '', endTime: '' }
  public closingPrice: any;
  public openingPrice: any;
  public timeRange: string = 'live'

  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [], borderWidth: 1,
        pointRadius: 0, label: 'Bitcoin(USDT)', borderColor: '#F7931A', tension: 0.1
      }
    ]
  };

  public lineChartOptions: ChartOptions = {
    responsive: true,
  };

  public lineChartType: ChartType = 'line';

  constructor(private cryptoService: CryptoTransactionService, private modalService: NgbModal, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.updateChartRange(this.timeRange)
    this.onResize()
  }

  onResize() {
    this.lineChartData.datasets[0].borderWidth = window.innerWidth > 850 ? 2 : 1;
  }


  loadHistoricalData(requestParams: any): void {
    this.lineChartData.labels = [];
    this.lineChartData.datasets[0].data = [];

    this.cryptoService.getHistoricalData(requestParams).subscribe((data: any) => {
      data.forEach((kline: any) => {
        const closingPrice = kline[4];
        const timestamp = this.timeRange == '30d' ? new Date(kline[0]).toLocaleDateString('fr-FR') : ['1d', 'live'].includes(this.timeRange) ? new Date(kline[0]).toLocaleTimeString('fr-FR') : new Date(kline[0]).toLocaleString('fr-FR');

        this.lineChartData.labels!.push(timestamp);
        this.lineChartData.datasets[0].data.push(parseFloat(closingPrice));
      });

      if (this.chart) {
        this.chart.update();
      }


      this.startRealTimeUpdates();

    });
  }

  startRealTimeUpdates(): void {

    this.cryptoService.getCryptoData('BTCUSDT').subscribe((message) => {
      this.openingPrice = parseFloat(message.k.o);
      this.closingPrice = parseFloat(message.k.c);
      const timestamp = new Date(message.k.t).toLocaleTimeString('fr-FR');

      this.lineChartData.datasets[0].data.push(this.closingPrice);
      this.lineChartData.labels!.push(timestamp);

      if (this.lineChartData.labels!.length > 10) {
        this.lineChartData.datasets[0].data.shift();
        this.lineChartData.labels!.shift();
      }
      if (this.timeRange == 'live') {
        if (this.chart) {
          this.chart.update();
        }
      }

    });
  }

  updateChartRange(range: string) {
    this.timeRange = range
    if (this.timeRange === '7d') {
      this.loadHistoricalData({
        ...this.requestParams, byRange: false, interval: '1h',// Utiliser des bougies de 1 heure pour 1 mois
        limit: 168
      })
    } else if (this.timeRange === '1d') {
      this.loadHistoricalData({
        ...this.requestParams, byRange: false, interval: '15m',// Utiliser des bougies de 1 heure pour 1 mois
        limit: 96
      })
    } else if (this.timeRange === '30d') {
      this.loadHistoricalData({
        ...this.requestParams, byRange: false, interval: '1h',// Utiliser des bougies de 1 heure pour 1 mois
        limit: 720
      })     // 24h * 30 jours = 720 bougies
    } else {
      this.loadHistoricalData({
        ...this.requestParams, byRange: false, interval: '1s',
        limit: 2000
      })
    }
  }

  customizeRange(startDate: string, endDate: string) {
    this.timeRange = '0'
    this.loadHistoricalData({
      ...this.requestParams, interval: '1s',
      limit: 2000, byRange: true, startTime: ((new Date(startDate).getTime())).toString(), endTime: ((new Date(endDate).getTime())).toString()
    })
    this.modalService.dismissAll();
  }

  openMdoModal(modContent: any) {
    const modalRef = this.modalService.open(modContent);
  }
}
