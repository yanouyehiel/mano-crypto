import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, of } from 'rxjs';
import {
  ResponseDeposit,
  ResponseTransactionList,
} from 'src/app/models/Transaction';
import { TransactionService } from 'src/app/services/transaction.service';
import { AwaitTransactionValidationComponent } from 'src/app/shared/components/await-transaction-validation/await-transaction-validation.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recharge-compte',
  templateUrl: './recharge-compte.component.html',
  styleUrls: ['./recharge-compte.component.scss'],
})
export class RechargeCompteComponent implements OnInit {
  public classStep1: string;
  public classStep2: string;
  public classStep3: string;
  public step!: number;
  public depositForm: FormGroup;
  public response?: ResponseDeposit;
  reloadHistory = false;
  setReload(){
    this.reloadHistory = !this.reloadHistory
  }
  private userSaved = localStorage.getItem('user-mansexch')

  constructor(
    private depositService: TransactionService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private router: Router
  ) {
    if (this.userSaved == null) {
      this.router.navigate(['/auth/login'])
    }
  }

  ngOnInit(): void {
    this.step = 1;
    this.classStep1 = 'current';
    this.depositForm = this.fb.group({
      amount: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      paiementMethod: ['', Validators.required],
    });
  }

  verifyPhoneNumber(): boolean {
    return true;
  }

  stepAttribute(step: number): void {
    this.step = step + 1;
    if (this.step === 1) {
      this.classStep1 = 'current';
      this.classStep2 = '';
      this.classStep3 = '';
    }
    if (this.step === 2) {
      this.classStep1 = '';
      this.classStep2 = 'current';
      this.classStep3 = '';
    }
    if (this.step === 3) {
      this.classStep1 = '';
      this.classStep2 = '';
      this.classStep3 = 'current';
    }
  }

  successRecharge(): void {
    Swal.fire('Terminé', 'Recharge effectué avec succès', 'success');
  }

  initBuyingProcess() {
    const data ={amount:this.depositForm.controls['amount'].value, phoneNumber:this.depositForm.controls['phoneNumber'].value.toString()}

    if (isNaN(data.amount) || data.amount <= 0) {
      Swal.fire('Erreur', 'Veuillez entrer un montant valide.', 'error');
      return;
    }

    Swal.fire({
      titleText: `Recharge de compte`,

      html: `Vous voulez effectuer une recharge de ${
        data.amount
      } F\nVeuillez saisir <b>${
        this.depositForm.value['paiementMethod'] == 'OM'
          ? '<span style="color:orange;">#150*50#</span>'
          : '<span style="color:yellow;">*126#</span>'
      }</b> pour valider la transaction.`,
      showLoaderOnConfirm: true,
      didRender: () => {
        try {
          this.depositService
            .addDeposit(data)
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
            .subscribe({
              next: (value) => {
                console.log(value)
                if (value.statusCode == 1000) {
                  this.successRecharge();
                  this.setReload()
                  setTimeout(() => {
                    Swal.close();
                  }, 2000);
                } else {
                  Swal.fire('Opération annulée', value.message, 'error');
                }

              },

              error: (err) =>
                console.error('Observable emitted an error: ' + err),
              complete: () =>{
                
              }

            });
        } catch (error: any) {
          Swal.showValidationMessage(
            `Impossible de traiter votre requête. Veuillez réessayer plus tard.`
          );
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
    this.stepAttribute(0);
  }
}
