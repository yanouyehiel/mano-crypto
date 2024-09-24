import { Component, OnInit } from '@angular/core';
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
import { CryptoTransactionService } from 'src/app/services/crypto-transaction.service';
import { ConfirmPasswordComponent } from 'src/app/shared/components/confirm-password/confirm-password.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-send-crypto',
  templateUrl: './send-crypto.component.html',
  styleUrls: ['./send-crypto.component.scss'],
})
export class SendCryptoComponent implements OnInit {
  private userSaved = localStorage.getItem('user-mansexch')

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private fb: FormBuilder,
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
            this.liveSpinner.style.display = "block";
          }
          // Utiliser forkJoin pour exécuter les requêtes en parallèle
          return this.transactionService.transactionFees({
            amount: term,
            currency: this.sendForm.value['currency'],
            
            type: "WITHDRAW_CRYPTO"
          });
          
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
      const liveContent = document.getElementById('live-content'); 
      if(liveContent){
        liveContent.style.display = 'flex';
      }
     
      const liveValue1 = document.getElementById('live-value1');
      if (liveValue1) {
        liveValue1.innerText = `${parseInt(response.data.xaf_amount).toLocaleString('fr-FR')+' XAF'}`;
      }
      const liveValue2 = document.getElementById('live-value2');
      if (liveValue2) {
        liveValue2.innerText = `${parseInt(response.data.xaf_fees).toLocaleString('fr-FR')+' XAF'}`;
      }
      const liveValue3 = document.getElementById('live-value3');
      if (liveValue3) {
        liveValue3.innerText = `${parseInt(response.data.xaf_network_fees).toLocaleString('fr-FR')+' XAF'}`;
      }
      const liveValue4 = document.getElementById('live-value4');
      if (liveValue4) {
        liveValue4.innerText = `${parseFloat(response.data.crypto_fees).toLocaleString('fr-FR')+' '+ this.sendForm.value['currency']}`;
      }
      const liveValue5 = document.getElementById('live-value5');
      if (liveValue5) {
        liveValue5.innerText = `${parseFloat(response.data.crypto_network_fees).toLocaleString('fr-FR')+' '+ this.sendForm.value['currency']}`;
      }
      const liveValue6 = document.getElementById('live-value6');
      if (liveValue6) {
        liveValue6.innerText = `${parseFloat(response.data.crypto_total).toLocaleString('fr-FR')+' '+ this.sendForm.value['currency']}`;
      }
     
    })
  }

  bindInputValue() {
    this.swalInputValue.next(this.sendForm.value['amount'])
  }

  getCryptoMinimumAmount() {
    if(this.sendForm.value['amount']){
      this.bindInputValue()
    }
    
    this.transactionService.getMinimumCryptoWithdrawAmount({ "currency": this.sendForm.value['currency'] }).subscribe((result) => {
      this.minimumCryptoWithdrawAmount = parseFloat(result.data.result)
    })
    
  }

  confirmIdentityModal() {
    if (isNaN(parseFloat(this.sendForm.value['amount']))) {
      this.alertMsg = "Renseignez le montant !"
    } else if (this.minimumCryptoWithdrawAmount! > this.sendForm.value['amount']) {
      this.alertMsg = `Le montant minimal doit etre ${this.minimumCryptoWithdrawAmount} !`
    }
    else if (this.sendForm.value['address'].length < 10) {
      this.alertMsg = "Renseignez l'addresse crypto du receveur !"
    } else if (this.sendForm.value['currency'].length < 1) {
      this.alertMsg = "Selectionnez la crypto-monnaie !"
    } else {
      let user = JSON.parse(localStorage.getItem('user-mansexch')!).user;
      if ((user.kyc as any[]).filter((e) => e.status != 'approved').length > 0) {
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
      let modalRef = this.modalService.open(ConfirmPasswordComponent);

      modalRef.dismissed.subscribe((res) => {
        if (res == true) {
          this.askConfirmTransaction()
        } else {
          this.failedAuth();
        }
      });

    }

    this.resetError()
  }

  askConfirmTransaction() {
    this.loadingTransfert = true;
    Swal.fire({
      titleText: `Transfert de ${this.sendForm.value['currency']}`,
      html: `Vous allez transferer <b class="text-success">${this.sendForm.value['amount']} ${this.sendForm.value['currency']}</b> a l'adresse ${this.sendForm.value['address']} <br> Veuilliez confirmer la transaction`,
      showDenyButton: true,
      confirmButtonText: 'Confirmer',
      denyButtonText: `Annuler`,
      showLoaderOnConfirm: true,
      preConfirm: async (value) => {
        try {
          const response = await this.transactionService
            .outvoice(this.sendForm.value).pipe(
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
      this.loadingTransfert = false
      if (result.isConfirmed) {
        if (result.value.statusCode == 1000) {
          this.success();
          this.setReload()
          setTimeout(() => {
            Swal.close();
          }, 2000);
        }else if (result.value.statusCode == 1001) {
          this.router.navigate(['/auth/login'])
        }  else {
          Swal.fire('L\'operation a echoue', result.value.message, 'error');
        }

      } else if (result.isDenied) {
        Swal.fire('Achat annulée', 'Vous avez annulé l\'opération !', 'error');
      }
    });
  }
  resetError() {
    this.loadingTransfert = false
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
