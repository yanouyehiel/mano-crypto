import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  Observable,
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  map,
  of,
  switchMap,
} from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { CryptoTransactionService } from 'src/app/services/crypto-transaction.service';
import { ConfirmPasswordComponent } from 'src/app/shared/components/confirm-password/confirm-password.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-share-to-friend',
  templateUrl: './share-to-friend.component.html',
  styleUrls: ['./share-to-friend.component.scss']
})
export class ShareToFriendComponent {
  private userSaved = localStorage.getItem('user-mansexch')

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private authService: AuthService,
    private transactionService: CryptoTransactionService) {
    if (this.userSaved == null) {
      this.router.navigate(['/auth/login'])
    }
  }

  public recentOrders: any[] = [];
  public loader: boolean = true;
  public sendForm: FormGroup;
  public alertMsg?: string;
  minimumCryptoWithdrawAmount?: number
  reloadHistory = false;
  swalInputValue = new Subject<string>();
  liveResponse$: Observable<any>;
  liveSpinner: HTMLElement | null;
  liveContent: HTMLElement | null;
  loadingTransfert = false;
  emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  phoneRegex = /^(\+237|237)?6[23789]\d{7}$/;

  setReload() {
    this.reloadHistory = !this.reloadHistory
  }


  ngOnInit(): void {
    this.liveSpinner = document.getElementById('live-spinner')
    this.liveContent = document.getElementById('live-content');
    this.sendForm = this.fb.group({
      amount: ['', Validators.required],
      address: ['', Validators.required],
      currency: ['USDT', Validators.required],
    });
    this.getCryptoMinimumAmount()
    this.liveResponse$ = this.swalInputValue.pipe(
      //On va attendre un certain temps avant de lancer la requete au serveur
      debounceTime(300),
      // Éviter les requêtes qui auront le même terme de recherche
      distinctUntilChanged(),
      switchMap((term) => {
        if (parseFloat(term) > 0) {

          if (this.liveSpinner) {
            this.liveSpinner.style.display = "inline-block";
          }
          console.log(this.sendForm.value)
          // Utiliser forkJoin pour exécuter les requêtes en parallèle
          return forkJoin({
            conversion: this.transactionService.convertToFiat({
              crypto_currency: this.sendForm.value['currency'],
              amount: term,
            }),
            fees: this.transactionService.getCryptoFees({
              crypto_currency: this.sendForm.value['currency'],
              amount: term,
            })

          }).pipe(
            // Combiner les résultats en un seul objet
            map(({ conversion, fees }) => ({
              conversion,
              fees
            }))
          );

        } else {
          return of(null);
        }
      })
    );

    this.liveResponse$.subscribe((response) => {

      this.liveSpinner!.style.display = 'none';
      if (this.liveContent) {
        this.liveContent.style.display = 'flex';
      }
      const liveValue1 = document.getElementById('live-value1');
      if (liveValue1) {
        liveValue1.innerText = `${response.conversion.data.xaf_amount && parseInt(response.conversion.data.xaf_amount).toLocaleString('fr-FR') + ' XAF'}`;
      }
      const liveValue2 = document.getElementById('live-value2');
      if (liveValue2) {
        liveValue2.innerText = `${response.fees.data.withdrawFees.fee && response.fees.data.withdrawFees.fee + ' ' + response.fees.data.withdrawFees.currency}`;
      }
      const liveValue3 = document.getElementById('live-value3');
      if (liveValue3) {
        let total1 = parseFloat(response.conversion.data.crypto_amount) + parseFloat(response.fees.data.withdrawFees.fee)

        liveValue3.innerText = `${(response.conversion.data.crypto_amount && response.fees.data.withdrawFees.fee) ? total1 + ' ' + response.fees.data.withdrawFees.currency : ''}`;
      }

    })
  }


  getCryptoMinimumAmount() {
    this.bindInputValue()
    this.transactionService.getMinimumCryptoWithdrawAmount({ "currency": this.sendForm.value['currency'] }).subscribe((result) => {
      this.minimumCryptoWithdrawAmount = parseFloat(result.data.result)
    })
  }

  bindInputValue() {
    this.swalInputValue.next(this.sendForm.value['amount'])
  }

  confirmIdentityModal() {

    if (isNaN(parseFloat(this.sendForm.value['amount']))) {
      this.alertMsg = "Renseignez le montant !"
    } else if (this.minimumCryptoWithdrawAmount! > this.sendForm.value['amount']) {
      this.alertMsg = `Le montant minimal doit etre ${this.minimumCryptoWithdrawAmount} !`
    }
    else if (this.sendForm.value['address'].length < 10) {
      this.alertMsg = "Renseignez l'addresse mail ou le numéro de télephone du receveur !"
    } else if (this.sendForm.value['currency'].length < 1) {
      this.alertMsg = "Selectionnez la crypto-monnaie !"
    } else if (!this.emailRegex.test(this.sendForm.value['address']) && !this.phoneRegex.test(this.sendForm.value['address'])) {
      this.alertMsg = "Email ou numéro invalide !"
    } else {
      let user = JSON.parse(localStorage.getItem('user-mansexch')!).user;
      if (false) {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: 'btn btn-danger'
          },
          buttonsStyling: false,
        });

        swalWithBootstrapButtons.fire({
          title: `Erreur`,
          text: `Vous devez faire valider votre compte avant d'effectuer cette operation !`,
          // type: 'warning',
          confirmButtonText: 'Valider mon compte',
          reverseButtons: true
        }).then((result: any) => {
          this.router.navigate(['/client/profile-edit'])
        })
        return
      }
      this.loadingTransfert = true;
      this.authService
        .sendOtp()
        .pipe(
          catchError((error) => {
            if (error.status === 0 || error.statusText === 'Unknown Error') {
              Swal.fire(
                'Erreur',
                `Erreur inconnue. Veuillez reessayer plus tard.`,
                'error'
              );
            }
            return of(error.error);
          })
        )
        .subscribe({
          next: (value) => {
            if (value.statusCode != 1000) {

              this.loadingTransfert = false;
              Swal.fire(
                'Erreur',
                value.message ||
                `Erreur de connexion Internet. Veuillez vérifier votre connexion.`,
                'error'
              );
            } else {
              this.otpVerificationAndWithdraw(value.data!.secret);
            }
          },
        });

    }
    this.resetError()
  }

  async otpVerificationAndWithdraw(secret: string) {
    const { value: result } = await Swal.fire({
      titleText: `Verification`,
      html: `Vous allez envoyer <b class="text-success">${this.sendForm.value['amount']} ${this.sendForm.value['currency']}</b> a l'utilisateur ${this.sendForm.value['address']} <br> Un code a été envoyé sur votre email, Veuillez le renseigner !`,
      input: 'text',
      inputAutoFocus: true,
      inputPlaceholder: `Code otp`,
      showCancelButton: true,
      confirmButtonText: 'Valider',
      cancelButtonText: 'Fermer',
      inputValidator: (value) => {
        // Ajoutez une validation personnalisée ici si nécessaire

        return null;
      },
      inputAttributes: {
        autocapitalize: 'off',
      },
      showLoaderOnConfirm: true,
      preConfirm: async (value) => {
        ;
        try {
          const data = this.emailRegex.test(this.sendForm.value['address']) ? {
            otpSecret: `${secret}`,
            otpCode: `${value}`,
            amount: parseInt(this.sendForm.value['amount']),
            email: this.sendForm.value['address'],
          } : {
            otpSecret: `${secret}`,
            otpCode: `${value}`,
            amount: parseInt(this.sendForm.value['amount']),
            phoneNumber: this.sendForm.value['address'],
          };
          const responseWithdraw = await this.transactionService
            .p2pTransfert(data)
            .pipe(catchError((error) => {
              this.loadingTransfert = false;
              if (error.status === 0 || error.statusText === 'Unknown Error') {
                Swal.showValidationMessage(
                  `Erreur de connexion Internet. Veuillez vérifier votre connexion.`
                );
              }

              return of(error.error)
            })
            )
            .toPromise();
          return responseWithdraw;
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
    ;
    this.loadingTransfert = false;
    if (result.statusCode !== 1000) {
      Swal.fire(
        'Erreur',
        result.message || `Erreur Inconnu. Veuillez reessayer plus tard.`,
        'error'
      );
    } else {
      Swal.fire('Terminé', 'Retrait initié avec succès.', 'success');

      this.setReload()
      setTimeout(() => {
        Swal.close();
      }, 2000);
    }
  }


  resetError() {
    setTimeout(() => {
      this.alertMsg = ''
    }, 3000)
  }

  success(): void {
    Swal.fire('Transfert initié !');
  }
  failedAuth(): void {
    Swal.fire('Erreur', "Echec de l'authentification", 'error');
  }
  error(): void {
    Swal.fire('Erreur', 'Vous ne pouvez pas faire ce retrait ', 'error');
  }
}
