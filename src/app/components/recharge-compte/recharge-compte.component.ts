import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, Observable, of } from 'rxjs';
import {
  ResponseDeposit,
  ResponseTransactionList,
} from 'src/app/models/Transaction';
import { TransactionService } from 'src/app/services/transaction.service';
import { UserService } from 'src/app/services/user.service';
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
  private userSaved: any

  constructor(
    private depositService: TransactionService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.step = 1;
    this.classStep1 = 'current';
    this.depositForm = this.fb.group({
      amount: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      paiementMethod: ['', Validators.required],
    });
    this.getProfileUser()
  }

  verifyPhoneNumber(): boolean {
    return true;
  }

  getProfileUser(): void {
    this.userService.getProfile().subscribe((response: any) => {
      this.userSaved = response.data.user
    }, (err) => {
      this.router.navigate(['/auth/login'])
    })
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

  async initBuyingProcess() {
    const data ={amount:this.depositForm.controls['amount'].value, phoneNumber:this.depositForm.controls['phoneNumber'].value.toString()}

    if (isNaN(data.amount) || data.amount <= 0) {
      Swal.fire('Erreur', 'Veuillez entrer un montant valide.', 'error');
      return;
    }

    if((this.userSaved.kyc as any[]).filter((e)=>e.status!='approved').length>0){
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
      }).then(()=>{
        this.router.navigate(['/client/profile-edit'])
      })
      return
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
                if (value.statusCode == 1000) {
                  this.getStatusTransaction(value.data.transaction._id).then(res => {
                    console.log(res)
                  })
                  //this.successRecharge();
                  this.setReload()
                  setTimeout(() => {
                    Swal.close();
                  }, 2000);
                } else if (value.statusCode == 1001) {
                  Swal.fire('Opération annulée', value.message, 'error');
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

  async getStatusTransaction(idTransaction: string) {
    await this.depositService.getSingleTransaction(idTransaction)
    .subscribe(result => {
      return result
    })
  }
}
