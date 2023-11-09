import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, of } from 'rxjs';
import {
  ResponseDeposit,
  ResponseTransactionList,
} from 'src/app/models/Transaction';
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
    private modalService: NgbModal,
    private depositService: TransactionService,
    private fb: FormBuilder
  ) {}

  public classStep1: string;
  public classStep2: string;
  public classStep3: string;
  public step!: number;
  public alertError:string = '';
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

  confirmIdentityModal(){
    this.retrait()
    // this.modalService.open(ConfirmPasswordComponent)
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

  ckeckConfirmation(){
    //TODO - check authentification
    console.log(this.userParse.user)
    console.log(this.userParse)
    console.log(!this.userParse.user.isPhoneNumberVerified)
    if(!this.userParse.user.isPhoneNumberVerified){
      this.phoneNotActive()
    }else{
      this.success()
    }
    this.modalService.dismissAll();
  }

  retrait(): void {
    const data = {
      amount: parseInt(this.depositForm.controls['amount'].value),
      phoneNumber: this.userParse.user.phoneNumber
    }
    console.log(data)
    this.depositService.withdraw(data).pipe(
      catchError((error: any) => {
        return of(error.error); // Retournez une valeur observable pour poursuivre le flux
      })
    ).subscribe((result) => {
      this.response = result;
      if (result.statusCode!==1000) {
        Swal.fire('Erreur', result.message, 'error');
      }else{
        Swal.fire('Terminé', 'Retrait effectué avec succès', 'success');
      }
    });
  }



  success(): void {
    Swal.fire('Retrait initié !');
  }
  phoneNotActive(): void {
    Swal.fire('Erreur', "Ce numero de telephone n'est pas activé?", 'error');
  }

  successRecharge(): void {
    Swal.fire('Retrait initié !');
  }

  //TODO - Will be updated
  getAllWithdrawals(): void {
    this.depositService
      .getAllTransaction()
      .subscribe((response: ResponseTransactionList) => {
        this.loader = false;
        this.recentOrders = response.data.transactions.filter(
          (deposit) => deposit.type === 'WITHDRAWAL'
        );
        console.log(this.recentOrders);
      });
  }
}
