import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  constructor(
    private router: Router,
    private modalService: NgbModal,
    private authService: AuthService,
    private depositService: TransactionService,
    private fb: FormBuilder
  ) {}

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

  ngOnInit(): void {
    this.step = 1;
    this.classStep1 = 'current';
    this.depositForm = this.fb.group({
      amount: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      paiementMethod: ['', Validators.required],
    });
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
          } else {
            this.otpVerificationAndWithdraw(value.data!.secret);
          }
        },
      });

    this.stepAttribute(0);
  }

  async otpVerificationAndWithdraw(secret: string) {
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
            phoneNumber: this.depositForm.controls['phoneNumber'].value.toString(),
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
      this.success();
      setTimeout(() => {
        Swal.close();
      }, 2000);
    }
  }

  success(): void {
    Swal.fire('Retrait initié !');
  }

}
