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
  public responseFee: ResponseCryptoFee;
  cryptoAmount: number;

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

  getFee(crypto: string, value: number) {
    this.cryptoService
      .getCryptoFees({
        crypto_currency: this.typeCrypto,
        amount: value,
      })
      .subscribe((response) => {
        this.responseFee = response;
      });
  }

  async initBuyingProcess(crypto: string) {
    const { value: result } = await Swal.fire({
      title: `Combien de<b class="text-success"> ${crypto} </b>voulez vous ?`,
      input: 'text',
      inputAutoFocus:true,
      inputPlaceholder: `Ex: 0.02`,
      showCancelButton: true,
      confirmButtonText: 'Acheter',
      cancelButtonText: 'Fermer',
      inputValidator: (value) => {
        // Ajoutez une validation personnalisée ici si nécessaire
        if (isNaN(parseFloat(value))) {
          return 'Veuillez entrer un nombre valide.';
        }
        return null
      },
      inputAttributes: {
        autocapitalize: 'off'
      },
      showLoaderOnConfirm: true,
      preConfirm: async (value) => {
        console.log(value)
        this.cryptoAmount = parseFloat(value);
        this.typeCrypto = crypto;
        try {
          const response = await this.cryptoService
            .getCryptoFees({
              crypto_currency: this.typeCrypto,
              amount: this.cryptoAmount,
            })
            .toPromise();
          if (response) {
            return response;
          } else {
            throw new Error('User not found');
          }
        } catch (error:any) {
          if (error.error) {
            Swal.showValidationMessage(`${error.error.message}`);
          } else {
            Swal.showValidationMessage(
              `Impossible de traiter votre requete, Veuillez reessayer plus tard`
            );
          }

          return null;
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (result) {
      this.askConfirmTransaction(result);
    }
  }

  askConfirmTransaction(value: any) {
    Swal.fire({
      title: `Le cout total de la transaction va s'elevé a<b class="text-success"> ${parseInt(
        value.data!.details.total
      ).toLocaleString('fr-FR')} XAF</b>`,
      showDenyButton: true,
      confirmButtonText: 'Payer',
      denyButtonText: `Annuler`,
      showLoaderOnConfirm: true,
      preConfirm: async (value) => {
        try {
          const response = await this.cryptoService
            .buyCrypto({
              crypto_currency: this.typeCrypto,
              amount: this.cryptoAmount,
            })
            .toPromise();
          if (response) {
            return response;
          } else {
            throw new Error("Can't buy");
          }
        } catch (error: any) {
          if (error.error) {
            Swal.showValidationMessage(`${error.error.message}`);
          } else {
            Swal.showValidationMessage(
              `Impossible de traiter votre requete, Veuillez reessayer plus tard`
            );
          }

          return null;
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result: any) => {
      if (result.isConfirmed && result.value.statusCode==1000) {
        Swal.fire(`Achat effectué avec success`, '', 'success');
      } else if (result.isDenied) {
        Swal.fire('Achat annulée', '', 'error');
      }
    });
  }
}
