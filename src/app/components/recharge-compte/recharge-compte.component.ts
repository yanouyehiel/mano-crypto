import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, debounce, debounceTime, Observable, of, switchMap, take, takeWhile, timer } from 'rxjs';
import {
  ResponseDeposit,
  ResponseParent,
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
  private statusTransaction: string = "";
  private isProcessing: boolean;
  private nbBoucle: number = 0

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
          this.isProcessing = true;
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
                this.processingSwal()
                if (value.statusCode == 1000) {
                  this.pollTransactionStatus(value.data.transaction._id).subscribe(
                    result => {
                      this.statusTransaction = result.data.transaction._id;
                      if (this.statusTransaction === 'SUCCESS') {
                        this.isProcessing = false;
                        this.setReload()
                        this.successRecharge();
                      }
                    },
                    error => {
                      console.error('Erreur lors de la vérification du statut', error);
                      this.isProcessing = false;
                      Swal.fire('Opération annulée', error.message, 'error');
                    },
                    () => {
                      // Cette fonction est appelée lorsque l'Observable est complété (après 3 tentatives ou un statut non-pending)
                      if (this.statusTransaction === 'PENDING') {
                        this.isProcessing = false;
                        Swal.fire('Opération annulée', "Le service de recharge ne sont pas disponibles pour l'instant", 'error');
                        this.setReload()
                        setTimeout(() => {
                          Swal.close();
                        }, 1000);
                      }
                    }
                  );
                  
                } else if (value.statusCode == 1001) {
                  Swal.fire('Opération annulée', value.message, 'error');
                } else {
                  Swal.fire('Opération annulée', value.message, 'error');
                }

              },

              error: (err) => {
                this.isProcessing = false;
                console.error('Observable emitted an error: ' + err)
              },

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

  processingSwal(): void {
    Swal.fire({
      titleText: "Recharge en cours",
      html: `
        <div class="col-md-4">
          <div class="loader-box">
            <div class="loader-2"></div>
          </div>
        </div>
      `,
      allowOutsideClick: () => !Swal.isLoading(),
    })
  }

  pollTransactionStatus(transactionId: string): Observable<ResponseParent> {
    return timer(0, 3000).pipe(
      switchMap(() => this.depositService.getSingleTransaction(transactionId)),
      takeWhile(value => value.data?.transaction.status === 'PENDING', true),
      take(3)
    );
  }
}
