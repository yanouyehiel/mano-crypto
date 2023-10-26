import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  Observable,
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from 'rxjs';
import { ResponseCryptoFee } from 'src/app/models/Transaction';
import { CryptoTransactionService } from 'src/app/services/crypto-transaction.service';
import { LayoutService } from 'src/app/services/layout.service';
import { NavService } from 'src/app/services/nav.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-crypto',
  templateUrl: './add-crypto.component.html',
  styleUrls: ['./add-crypto.component.scss'],
})
export class AddCryptoComponent implements OnInit {
  public earningData = [
    {
      id: 1,
      classCompo: 'bg-primary',
      icon: 'database',
      title: 'Fcfa XAF',
      count: '56850',
    },
    {
      id: 2,
      classCompo: 'bg-secondary',
      icon: 'shopping-bag',
      title: 'USD USA',
      count: '56850',
    },
  ];

  public items = [
    {
      name: 'Bitcoin',
      abv: 'BTC',
      value: 6,
    },
    {
      name: 'Etheurium',
      abv: 'ETH',
      value: 10,
    },
    {
      name: 'LitCoin',
      abv: 'LTC',
      value: 20,
    },
  ];

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


  public typeCrypto: string;
  public recentOrders: any[] = [];
  public loader: boolean = true;
  public responseFee: ResponseCryptoFee;
  cryptoAmount = new Subject<number>();

  constructor(
    private modalService: NgbModal,
    public navService: NavService,
    public layoutService: LayoutService,
    private cryptoService: CryptoTransactionService
  ) {}

  ngOnInit(): void {

  }

  VerticallyCenteredModal(verticallyContent: any, item: any) {
    const modalRef = this.modalService.open(verticallyContent);
    this.typeCrypto = item;
  }

  get layoutClass() {
    return (
      this.layoutService.config.settings.sidebar_type +
      ' ' +
      this.layoutService.config.settings.layout.replace('layout', 'sidebar')
    );
  }

  getFee(crypto:string, value:number) {
    this.cryptoService.getCryptoFees({
      crypto_currency: this.typeCrypto,
      amount: value,
    }).subscribe((response)=>{
      this.responseFee = response
    })

  }




  async initBuyingProess(crypto:string) {
    const { value: result } = await Swal.fire({
      title: `Combien de ${crypto} voulez vous ?`,
      input: 'number',
      inputPlaceholder:`Ex: 0.02`,
      inputAttributes: {
        autocapitalize: 'off',
      },
      showCancelButton: true,
      confirmButtonText: 'Acheter',
      cancelButtonText: 'Fermer',
      showLoaderOnConfirm: true,
      preConfirm: async (value) => {
        try {
          const response = await this.cryptoService.getCryptoFees({
            crypto_currency: crypto,
            amount: parseFloat(value),
          }).toPromise();
          if (response) {
            return response;
          } else {
            throw new Error('User not found');

          }

        } catch (error) {
          console.log(error)
          Swal.showValidationMessage(`Request failed: ${error}`);
          return null
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (result) {
      console.log(result)
      this.askConfirmTransaction(result);
    }
  }

  askConfirmTransaction(value:any){
    Swal.fire({
      title:`Le cout total de la transaction vont s'elevé a ${parseInt(value.data!.details.total)} XAF`,
      showDenyButton: true,
      confirmButtonText: 'Valider',
      denyButtonText: `Annuler`,
    }).then((result: any) => {
      if (result.isConfirmed) {
        Swal.fire(`Achat effectué avec success`, '', 'success')
      } else if (result.isDenied) {
        Swal.fire('Achat annulée', '', 'error')
      }
    })
  }

}

