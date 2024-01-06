import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  catchError,
  of,
} from 'rxjs';
import { ResponseParent } from 'src/app/models/Transaction';
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

  public typeCrypto: string;
  public recentOrders: any[] = [];
  public loader: boolean = true;
  public responseFee: ResponseParent;
  reload = false;
  cryptoAmount: number;
  xafAmount: number;

  constructor(
    private modalService: NgbModal,
    public navService: NavService,
    public layoutService: LayoutService,
    private cryptoService: CryptoTransactionService
  ) { }

  ngOnInit(): void { }

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
      titleText: `Achat de ${crypto}`,
      html: `Combien de ${crypto} voulez vous acheter?`,
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
        return null
      },
      inputAttributes: {
        autocapitalize: 'off'
      },
      showLoaderOnConfirm: true,
      preConfirm: async (value) => {

        this.cryptoAmount = parseFloat(value);
        this.typeCrypto = crypto;
        try {
          const responseFees = await this.cryptoService
            .getCryptoFees({
              crypto_currency: this.typeCrypto,
              amount: this.cryptoAmount,
            }).pipe(
              catchError((error) => {
                if (
                  error.status === 0 ||
                  error.statusText === 'Unknown Error'
                ) {
                  Swal.fire(
                    'Erreur',
                    `Erreur de connexion Internet. Veuillez vérifier votre connexion.`,
                    'error'
                  );
                }

                return of(error.error);
              })
            )
            .toPromise();
          const responseAmountToXAF = await this.cryptoService
            .convertToFiat({
              crypto_currency: this.typeCrypto,
              amount: this.cryptoAmount,
            }).pipe(
              catchError((error) => of(error.error))
            )
            .toPromise();
          if (responseFees.statusCode == 1000 && responseAmountToXAF.statusCode == 1000) {
            const responseFeeToXAF = await this.cryptoService
              .convertToFiat({
                crypto_currency: this.typeCrypto,
                amount: parseFloat(responseFees.data.buyFees.fee),
              }).pipe(
                catchError((error) => of(error.error))
              )
              .toPromise();
            if (responseFeeToXAF.statusCode != 1000) {
              throw new Error(responseFeeToXAF);
            }
            this.xafAmount = parseInt(responseAmountToXAF.data.xaf_amount) + parseInt(responseFeeToXAF.data.xaf_amount)
            return responseFeeToXAF;
          } else {
            throw new Error('User not found');
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
    });


    if (result.statusCode != 1000) {
      Swal.fire('Achat annulée', result.message, 'error');
    } else {
      this.askConfirmTransaction(result);
    }
  }

  askConfirmTransaction(value: any) {
    Swal.fire({
      titleText: `Recharge de ${this.typeCrypto}`,
      html: `Le cout total de la transaction va s'elevé a<b class="text-success"> ${this.xafAmount.toLocaleString('fr-FR')} XAF</b>`,
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
            }).pipe(
              catchError((error) => {
                if (error.status === 0 || error.statusText === 'Unknown Error') {
                  Swal.showValidationMessage(
                    `Erreur de connexion Internet. Veuillez vérifier votre connexion.`
                  );
                }

                return of(error.error)
              })
            )
            .toPromise();
          if (response) {
            return response;
          } else {
            throw new Error("Can't buy");
          }
        } catch (error: any) {

          Swal.showValidationMessage(
            `Impossible de traiter votre requete, Veuillez reessayer plus tard`
          );
          return null;
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result: any) => {

      if (result.isConfirmed) {
        if (result.value.statusCode === 1000) {
          Swal.fire('Success', `Achat effectué avec success`, 'success');
          // this.reload = true;
        } else {
          Swal.fire('Achat annulée', result.value.message, 'error');
        }

      } else if (result.isDenied) {
        Swal.fire('Achat annulée', '', 'error');
      }
      // this.reload = false;
    });
  }
}
