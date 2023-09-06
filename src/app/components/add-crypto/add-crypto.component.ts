import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LayoutService } from 'src/app/services/layout.service';
import { NavService } from 'src/app/services/nav.service';

@Component({
  selector: 'app-add-crypto',
  templateUrl: './add-crypto.component.html',
  styleUrls: ['./add-crypto.component.scss']
})
export class AddCryptoComponent implements OnInit {

  public earningData = [
    {
      id: 1,
      classCompo: 'bg-primary',
      icon: 'database',
      title: 'Fcfa XAF',
      count: '56850'
    },
    {
      id: 2,
      classCompo: 'bg-secondary',
      icon: 'shopping-bag',
      title: 'USD USA',
      count: '56850'
    }
  ];

  public items = [
    {
      name: 'Bitcoin',
      abv: 'BTC',
      value: 6
    },
    {
      name: 'Etheurium',
      abv: 'ETH',
      value: 10
    },
    {
      name: 'LitCoin',
      abv: 'LTC',
      value: 20
    }
  ]

  public currentValues = [
    {
      type: 'BTC',
      value: 12.63,
      actuelValue: 39485000,
      class: 'primary'
    },
    {
      type: 'ETH',
      value: 4.63,
      actuelValue: 22251,
      class: 'secondary'
    },
    {
      type: 'LTC',
      value: 54.6,
      actuelValue: 39485,
      class: 'primary'
    }
  ]

  constructor(
    private modalService: NgbModal,
    public navService: NavService,
    public layoutService: LayoutService,) {}

  ngOnInit(): void {
    console.log('add crypto')
  }

  VerticallyCenteredModal(verticallyContent:any){
    const modalRef = this.modalService.open(verticallyContent);
  }

  get layoutClass() {
    return (
      this.layoutService.config.settings.sidebar_type +
      ' ' +
      this.layoutService.config.settings.layout.replace('layout', 'sidebar')
    );
  }
}
