import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  Observable,
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  switchMap,
} from 'rxjs';
import { ResponseCryptoFee, ResponseParent } from 'src/app/models/Transaction';
import { CryptoTransactionService } from 'src/app/services/crypto-transaction.service';
import { LayoutService } from 'src/app/services/layout.service';
import { NavService } from 'src/app/services/nav.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recharge-crypto',
  templateUrl: './recharge-crypto.component.html',
  styleUrls: ['./recharge-crypto.component.scss'],
})
export class RechargeCryptoComponent implements OnInit {
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
      value: 31000,
      icon: 'https://raw.githubusercontent.com/coinwink/cryptocurrency-logos/master/coins/128x128/1.png',
    },
    {
      name: 'Etheurium',
      abv: 'ETH',
      value: 1900,
      icon: 'https://raw.githubusercontent.com/coinwink/cryptocurrency-logos/master/coins/128x128/1027.png',
    },
  ];

  public currentValues = [
    {
      type: 'BTC',
      value: 12.63,
      actuelValue: 39485000,
      class: 'primary',
      icon: 'https://raw.githubusercontent.com/coinwink/cryptocurrency-logos/master/coins/128x128/1.png',
    },
    {
      type: 'ETH',
      value: 4.63,
      actuelValue: 22251,
      class: 'secondary',
      icon: 'https://raw.githubusercontent.com/coinwink/cryptocurrency-logos/master/coins/128x128/1027.png',
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
  cryptoAmount: number;
  public url =
    'https://nowpayments.io/payment/?iid=4844525512&paymentId=5102569096';

  constructor(
    private modalService: NgbModal,
    public navService: NavService,
    public layoutService: LayoutService,
    private cryptoService: CryptoTransactionService
  ) {}

  ngOnInit(): void {}

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

  async initBuyingProcess(crypto: string) {
    const { value: result } = await Swal.fire({
      titleText: `Recharge de ${crypto}`,
      html: `Combien de ${crypto} voulez vous recharger?`,
      input: 'text',
      inputAutoFocus: true,
      inputPlaceholder: `Ex: 0.02`,
      showCancelButton: true,
      confirmButtonText: 'Acheter',
      cancelButtonText: 'Fermer',
      inputValidator: (value) => {
        // Ajoutez une validation personnalisée ici si nécessaire
        if (isNaN(parseFloat(value))) {
          return 'Veuillez entrer un nombre valide.';
        }
        return null;
      },
      inputAttributes: {
        autocapitalize: 'off',
      },
      showLoaderOnConfirm: true,
      preConfirm: async (value) => {
        console.log(value);
        this.cryptoAmount = parseFloat(value);
        this.typeCrypto = crypto;
        try {
          const response = await this.cryptoService
            .importCrypto({
              crypto_currency: this.typeCrypto,
              amount: this.cryptoAmount,
            })
            .pipe(catchError((error) => {
              if (error.status === 0 || error.statusText === 'Unknown Error') {
                Swal.showValidationMessage(
                  `Erreur de connexion Internet. Veuillez vérifier votre connexion.`
                );
              }
             return of(error.error)}))
            .toPromise();
          if (response) {
            return response;
          } else {
            throw new Error('User not found');
          }
        } catch (error: any) {
          console.log(error);

          Swal.showValidationMessage(
            `Impossible de traiter votre requete, Veuillez reessayer plus tard`
          );

          // return null;
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (result) {
      console.log(result)
      if (result.statusCode == 1000) {
        Swal.fire(
          'Success',
          `Veuillez suivre la procedure <a href='${result.data.invoice_url}' style="color:green;" target='_blank'>en cliquant ici</a>`,
          'info'
        );
        window.open(result.data.invoice_url, '_blank');
      } else {
        Swal.fire('Operation annulée', result.message.error, 'error');
      }
    }
  }
}
