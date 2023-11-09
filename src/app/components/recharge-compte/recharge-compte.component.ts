import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, of } from 'rxjs';
import { ResponseDeposit, ResponseTransactionList } from 'src/app/models/Transaction';
import { TransactionService } from 'src/app/services/transaction.service';
import { AwaitTransactionValidationComponent } from 'src/app/shared/components/await-transaction-validation/await-transaction-validation.component';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-recharge-compte',
  templateUrl: './recharge-compte.component.html',
  styleUrls: ['./recharge-compte.component.scss']
})
export class RechargeCompteComponent implements OnInit {
  public classStep1: string;
  public classStep2: string;
  public classStep3: string;
  public step!: number;
  public depositForm: FormGroup;
  private userRegistred: any = localStorage.getItem('user-mansexch')
  private userParse: any = JSON.parse(this.userRegistred)
  public response?:ResponseDeposit


  constructor(
    private depositService: TransactionService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {}

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

    console.log(this.depositForm.value)
    this.step = step + 1;
    if (this.step === 1) {
      this.classStep1 = 'current'
      this.classStep2 = ''
      this.classStep3 = ''
    }
    if (this.step === 2) {
      this.classStep1 = ''
      this.classStep2 = 'current'
      this.classStep3 = ''
    }
    if (this.step === 3) {
      this.classStep1 = ''
      this.classStep2 = ''
      this.classStep3 = 'current'
    }
  }

  addRecharge1(): void {
    const data = {
      amount: parseInt(this.depositForm.controls['amount'].value),
      phoneNumber: this.userParse.user.phoneNumber
    }

      this.depositService.addDeposit(data).pipe(
        catchError((error: any) => {
          return of(error.error); // Retournez une valeur observable pour poursuivre le flux
        })
      ).subscribe((result) => {
        this.response = result;
        if (result.statusCode!==1000) {
          Swal.fire('Erreur', result.message, 'error');
        }else{
          this.modalService.open(AwaitTransactionValidationComponent).dismissed.subscribe(()=>{
            this.successRecharge()
          })
        }
      });
  }

  successRecharge(): void {
    Swal.fire('Terminé', 'Recharge effectué avec succès', 'success');
  }

  async initBuyingProcess() {
    const amount = parseFloat(this.depositForm.controls['amount'].value);
    const phoneNumber = this.userParse.user.phoneNumber;

    if (isNaN(amount) || amount <= 0) {
      Swal.fire('Erreur', 'Veuillez entrer un montant valide.', 'error');
      return;
    }

    const data = { amount, phoneNumber };

    const { value: result } = await Swal.fire({
      titleText: `Recharge de compte`,
      
      html: `Vous voulez effectuer une recharge de ${data.amount}\nVeuillez saisir <b>${this.depositForm.value['paiementMethod']=="OM"?'<span style="color:orange;">#150*50#</span>':'<span style="color:yellow;">*126#</span>'}</b> pour valider la transaction.`,
      showLoaderOnConfirm: true,
      didRender: async () => {
        try {
          const response = await this.depositService.addDeposit(data)
            .pipe(catchError((error) => of(error.error)))
            .toPromise();

          if (response) {
            Swal.clickConfirm(); // Simule un clic sur le bouton de confirmation
          } else {
            throw new Error('Une erreur s\'est produite');
          }
        } catch (error: any) {
          console.log(error);
          Swal.showValidationMessage(
            `Impossible de traiter votre requête. Veuillez réessayer plus tard.`
          );
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (result && result.statusCode == 1000) {
      this.successRecharge();
    } else {
      Swal.fire('Opération annulée', result?.message || 'Une erreur s\'est produite', 'error');
    }
  }


}
