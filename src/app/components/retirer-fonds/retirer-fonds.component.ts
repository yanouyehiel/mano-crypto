import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, of } from 'rxjs';
import {
  ResponseDeposit,
  ResponseParent,
  ResponseTransactionList,
} from 'src/app/models/Transaction';
import { AuthService } from 'src/app/services/auth.service';
import { TransactionService } from 'src/app/services/transaction.service';
import { ConfirmPasswordComponent } from 'src/app/shared/components/confirm-password/confirm-password.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-retirer-fonds',
  templateUrl: './retirer-fonds.component.html',
  styleUrls: ['./retirer-fonds.component.scss'],
})
export class RetirerFondsComponent implements OnInit {
  private userSaved = localStorage.getItem('user-mansexch')
  public loading = false;
  public operators: any[] = [];

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private authService: AuthService,
    private depositService: TransactionService,
    private fb: FormBuilder,
  ) {
    if (this.userSaved == null) {
      this.router.navigate(['/auth/login'])
    }
  }

  public classStep1: string;
  public classStep2: string;
  public classStep3: string;
  public step!: number;
  public alertError: string = '';
  public depositForm: FormGroup;
  private userRegistred: any = localStorage.getItem('user-mansexch');
  public userParse: any = JSON.parse(this.userRegistred);
  public recentOrders: any[] = [];
  public loader: boolean = true;
  public response: ResponseDeposit;
  reloadHistory = false;
  public phonePlaceholder = 'Entrer le numéro de téléphone';
  setReload(){
    this.reloadHistory = !this.reloadHistory
  }

  ngOnInit(): void {
    this.loadOperators()
    this.step = 1;
    this.classStep1 = 'current';
    this.depositForm = this.fb.group({
      amount: ['', Validators.required],
      phoneNumber: ['', [Validators.required, this.phoneValidator.bind(this)]],
      paiementMethod: ['', Validators.required],
    });

    const paiementMethodControl = this.depositForm.get('paiementMethod');
    if (paiementMethodControl) {
      paiementMethodControl.valueChanges.subscribe(() => {
        this.updatePhonePlaceholder();
      });
    }

    this.updatePhonePlaceholder();
  }

  updatePhonePlaceholder() {
    const selectedOperator = this.depositForm.controls['paiementMethod'].value;
    switch (selectedOperator) {
      case 'airtel-gabon':
        this.phonePlaceholder = 'Ex: 066123456';
        break;
      case 'orange-cameroun':
        this.phonePlaceholder = 'Ex: 699123456';
        break;
      case 'mtn-cameroun':
        this.phonePlaceholder = 'Ex: 651234567';
        break;
      default:
        this.phonePlaceholder = 'Entrer le numéro de téléphone';
    }
  }

  get phoneOperator(): string {
    const phoneNumber = this.depositForm.controls['phoneNumber'].value;
    if (!phoneNumber) return '';

    const operator = this.checkPhoneNumber(phoneNumber);
    switch (operator) {
      case 'Airtel Gabon':
        return 'Airtel Gabon';
      case 'Orange Cameroun':
        return 'Orange Cameroun';
      case 'MTN Cameroun':
        return 'MTN Cameroun';
      default:
        return 'Opérateur inconnu';
    }
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

  // Validateur personnalisé Angular pour le champ numéro de téléphone
  phoneValidator(control: AbstractControl): ValidationErrors | null {
    const val = control.value;
    if (!val) return null;
    return this.checkPhoneNumber(val) === 'Invalid' ? { invalidPhoneNumber: true } : null;
  }

  checkPhoneNumber(phoneNumber: string): 'Airtel Gabon' | 'Orange Cameroun' | 'MTN Cameroun' | 'Invalid' {
    const normalized = phoneNumber.replace(/\s|-/g, '');

    const airtelGabonRegex = /^0[67]\d{7}$/;

    const orangeCameroonRegex = /^(69\d{7}|65[5-9]\d{6})$/;

    const mtnCameroonRegex = /^(67\d{7}|65[0-4]\d{6}|68[0-3]\d{6})$/;

    if (airtelGabonRegex.test(normalized)) {
      return 'Airtel Gabon';
    } else if (orangeCameroonRegex.test(normalized)) {
      return 'Orange Cameroun';
    } else if (mtnCameroonRegex.test(normalized)) {
      return 'MTN Cameroun';
    } else {
      return 'Invalid';
    }
  }

  initTransaction() {
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
      }).then(()=>{
        this.router.navigate(['/client/profile-edit'])
      })
      return
    }

    const data = {
      currency: 'XAF',
      amount: this.depositForm.controls["amount"].value,
      type: "WITHDRAW"
    }

    this.depositService.getFees(data).subscribe(res => {
      if (res.statusCode === 1000) {
        Swal.fire({
          titleText: "Récapitulatif financier du retrait",
          showCancelButton: true,
          html: `
          <p><i class="fa fa-spin fa-spinner" style="display:none;" id="live-spinner"></i></p>
          <ul>
            <li>Montant initié : <span style="color:green;">${res.data.amount} XAF</span></li>
            <li>Frais de réseau : <span style="color:green;">${res.data.amount - res.data.total} XAF</span></li>
            <li>Net à recevoir : <span style="color:green;">${res.data.total} XAF</span></li>
          </ul>`,
          confirmButtonText: 'Continuer',
          cancelButtonText: 'Annuler',
          showLoaderOnConfirm: true,
          preConfirm: async (value) => {
            this.authService
            .sendOtp()
            .pipe(
              catchError((error) => {
                if (error.status === 0 || error.statusText === 'Unknown Error') {
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
                if (value.statusCode != 1000) {
                  Swal.fire(
                    'Erreur',
                    value.message ||
                      `Erreur de connexion Internet. Veuillez vérifier votre connexion.`,
                    'error'
                  );
                } else if (value.statusCode === 1001) {
                  this.router.navigate(['/auth/login'])
                } else {
                  this.otpVerificationAndWithdraw(value.data!.secret);
                }
              },
            });
          },
          allowOutsideClick: () => !Swal.isLoading(),
        })
      } else {
        Swal.fire(
          'Erreur',
          `Veuillez reessayer.`,
          'error'
        );
      }
    })
    this.stepAttribute(0);
  }

  async otpVerificationAndWithdraw(secret: string) {
    const phoneNumberControl = this.depositForm.controls['phoneNumber'];
    let phoneNumber = phoneNumberControl.value.toString();

    const operator = this.checkPhoneNumber(phoneNumber);
    switch(operator) {
      case 'Orange Cameroun':
        phoneNumber = '237' + phoneNumber;
        break;
      case 'MTN Cameroun':
        phoneNumber = '237' + phoneNumber;
        break;
      case 'Airtel Gabon':
        phoneNumber = '241' + phoneNumber;
        break;
      default:
        break;
    }

    const { value: result } = await Swal.fire({
      titleText: `Verification`,
      html: `Un code a été envoyé sur votre email, Veuillez le renseigner !`,
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
          const data = {
            otpSecret: `${secret}`,
            otpCode: `${value}`,
            amount: parseInt(this.depositForm.controls['amount'].value),
            phoneNumber: phoneNumber
          };
          const responseWithdraw = await this.depositService
            .withdraw(data)
            .pipe(catchError((error) => of(error.error)))
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

  success(): void {
    Swal.fire('Retrait initié !');
  }

  loadOperators() {
    this.loading = true;
    this.depositService.getOperators().subscribe({
      next: (response) => {
        if (response.statusCode === 1000) {
          this.operators = response.data
          .filter((op: any) => op.isActive);
          console.log('operators', this.operators);
        }
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
      }
    });
  }
}
