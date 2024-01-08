import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, of } from 'rxjs';
import { CryptoTransactionService } from 'src/app/services/crypto-transaction.service';
import { ConfirmPasswordComponent } from 'src/app/shared/components/confirm-password/confirm-password.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-send-crypto',
  templateUrl: './send-crypto.component.html',
  styleUrls: ['./send-crypto.component.scss'],
})
export class SendCryptoComponent implements OnInit {
  constructor(private router:Router, private modalService: NgbModal, private fb: FormBuilder, private transactionService: CryptoTransactionService) { }
  public recentOrders: any[] = [];
  public loader: boolean = true;
  public sendForm: FormGroup;
  public alertMsg?: string;

  ngOnInit(): void {
    this.sendForm = this.fb.group({
      amount: ['', Validators.required],
      address: ['', Validators.required],
      currency: ['BTC', Validators.required],
    });
  }


  confirmIdentityModal() {
    if (isNaN(parseFloat(this.sendForm.value['amount']))) {
      this.alertMsg = "Renseignez le montant !"
    }
    else if (this.sendForm.value['address'].length < 10) {
      this.alertMsg = "Renseignez l'address !"
    } else if (this.sendForm.value['currency'].length < 1) {
      this.alertMsg = "Selectionnez la crypto-monnaie !"
    } else {
      let user = JSON.parse(localStorage.getItem('user-mansexch')!).user;
    if((user.kyc as any[]).filter((e)=>e.status!='approved').length>0){
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
      }).then((result:any)=>{
        this.router.navigate(['/client/profile-edit'])
      })
      return
    }
      let modalRef = this.modalService.open(ConfirmPasswordComponent);

      modalRef.dismissed.subscribe((res) => {
        if (res == true) {
          this.initTransfert()
        } else {
          this.failedAuth();
        }
      });

    }



    this.resetError()
  }

  initTransfert() {
    this.transactionService.getCryptoFees({ 'crypto_currency': this.sendForm.value['currency'], 'amount': this.sendForm.value['amount'] })
      .pipe(
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
      .subscribe((value) => {
        if (value.statusCode == 1000) {
          this.askConfirmTransaction(value)
        } else {
          Swal.fire('L\'operation a echoue', value.message, 'error');
        }

      })
  }
  askConfirmTransaction(value: any) {
    Swal.fire({
      titleText: `Transfert de ${this.sendForm.value['currency']}`,
      html: `Le cout total de la transaction va s'elevé a<b class="text-success"> ${(parseFloat(value.data.withdrawFees.fee) + parseFloat(this.sendForm.value['amount']))} ${this.sendForm.value['currency']}</b>`,
      showDenyButton: true,
      confirmButtonText: 'Transferer',
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
      
      if (result.isConfirmed) {
        if (result.value.statusCode == 1000) {
          this.success();
          setTimeout(() => {
            Swal.close();
          }, 2000);
        } else {
          Swal.fire('L\'operation a echoue', value.message, 'error');
        }

      } else if (result.isDenied) {
        Swal.fire('Achat annulée', '', 'error');
      }
    });
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
    Swal.fire('Erreur', 'Vous ne pouvez pas faire ce retrait ?', 'error');
  }
}
