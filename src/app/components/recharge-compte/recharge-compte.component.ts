import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, Observable, of, switchMap, take, takeWhile, timer } from 'rxjs';
import { Configuration } from 'src/app/models/pricings-elements';
import {
  ResponseDeposit,
  ResponseParent,
} from 'src/app/models/Transaction';
import { AdminService } from 'src/app/services/admin.service';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { TransactionService } from 'src/app/services/transaction.service';
import { UserService } from 'src/app/services/user.service';
import { PricingItem } from 'src/app/shared/components/pricing-grid/pricing-grid.component';
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
  operators: any[] = [];
  configs: Configuration[] = []
  selectedOperator: any
  loading = false;
  public step!: number;
  public depositForm: FormGroup;
  public response?: ResponseDeposit;
  reloadHistory = false;
  setReload() {
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
    private userService: UserService,
    private configurationService: ConfigurationService
  ) { }

  ngOnInit(): void {
    this.configurationService.getConfigurations().subscribe((configs) => {
      this.configs = configs
    })
    this.loadOperators()

    this.step = 1;
    this.classStep1 = 'current';
    this.depositForm = this.fb.group({
      amount: ['', Validators.required,],
      phoneNumber: ['', Validators.required,],
      paiementMethod: ['', Validators.required],
    });
    this.getProfileUser()
    this.setupFormValidation();
  }

  verifyPhoneNumber(): boolean {
    return true;
  }

  getMinAmount(){
    return this.configs.find(c => c.key === 'MIN_XAF_AMOUNT') ? parseInt(this.configs.find(c => c.key === 'MIN_XAF_AMOUNT')!.value.toString()) : 500;
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
    const data = { amount: this.depositForm.controls['amount'].value, phoneNumber: `${this.selectedOperator.countryCode}${this.depositForm.controls['phoneNumber'].value.toString()}` }

    if (isNaN(data.amount) || data.amount <= 0) {
      Swal.fire('Erreur', 'Veuillez entrer un montant valide.', 'error');
      return;
    }

    if ((this.userSaved.kyc as any[]).filter((e) => e.status != 'approved').length > 0) {
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
      }).then(() => {
        this.router.navigate(['/client/profile-edit'])
      })
      return
    }

    Swal.fire({
      titleText: `Recharge de compte`,
      html: `Vous voulez effectuer une recharge de ${data.amount
        } F\n${(this.getSelectedOperator().slug.includes('mtn') || this.getSelectedOperator().slug.includes('orange')) ? `Veuillez saisir <b>${this.getSelectedOperator().slug.includes('orange')
          ? '<span style="color:orange;">#150*50#</span>'
          : '<span style="color:yellow;">*126#</span>'
          }</b>` : 'Veuillez suivre la procedure'} pour valider la transaction.`,
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
                setTimeout(() => {
                  Swal.close();
                }, 3000);
                /*if (value.statusCode == 1000) {
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
                     
                      this.isProcessing = false;
                      Swal.fire('Opération annulée', error.message, 'error');
                    },
                    () => {
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
                }*/

              },

              error: (err) => {
                this.isProcessing = false;
              },

              complete: () => {

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
        <div style="display: flex; justify-content: center; align-items: center;">
          <div class="col-md-4">
            <div class="loader-box">
              <div class="loader-2"></div>
            </div>
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


  loadOperators() {
    this.loading = true;
    this.depositService.getOperators().subscribe({
      next: (response) => {
        if (response.statusCode === 1000) {
          this.operators = response.data
            .filter((op: any) => op.isActive);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des opérateurs:', error);
        this.loading = false;
      }
    });
  }
  setupFormValidation() {
    this.depositForm.get('paiementMethod')?.valueChanges.subscribe(operatorSlug => {
      this.selectedOperator = this.operators.find(op => op.slug === operatorSlug) || null;
      this.updatePhoneValidation();
    });
  }

  updatePhoneValidation() {
    const phoneControl = this.depositForm.get('phoneNumber');

    if (this.selectedOperator && phoneControl) {
      phoneControl.clearValidators();

      const validators = [Validators.required];

      if (this.selectedOperator.phoneRegex) {
        validators.push(Validators.pattern(this.selectedOperator.phoneRegex));
      }

      phoneControl.setValidators(validators);
      phoneControl.updateValueAndValidity();
    }
  }

  getSelectedOperator(): any {
    return this.selectedOperator;
  }

  getPhoneErrorMessage(): string {
    const phoneControl = this.depositForm.get('phoneNumber');

    if (phoneControl?.hasError('required')) {
      return 'Le numéro de téléphone est requis';
    }

    if (phoneControl?.hasError('pattern') && this.selectedOperator) {
      return `Format invalide pour ${this.selectedOperator.name}`;
    }

    return '';
  }

  isPhoneValid(): boolean {
    return this.depositForm.get('phoneNumber')?.valid || false;
  }

  getPhonePlaceholder(): string {
    if (!this.selectedOperator) {
      return 'Sélectionnez d\'abord un opérateur';
    }

    const examples: { [key: string]: string } = {
      'orange-cm': 'Ex: 699123456',
      'mtn-cm': 'Ex: 677123456',
      'airtel-money-ga': 'Ex: 066123456',
      'moov-money-ga': 'Ex: 025123456'
    };

    return examples[this.selectedOperator.slug] || `Numéro ${this.selectedOperator.name}`;
  }
}
