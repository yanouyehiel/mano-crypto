import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
  public recentOrders: any[] = [];
  public loader: boolean = true;

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
    this.getAllDeposits()
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

  addRecharge(): void {
    this.loader = true;
    const data = {
      amount: parseInt(this.depositForm.controls['amount'].value),
      phoneNumber: this.userParse.user.phoneNumber
    }
    try {
      this.depositService.addDeposit(data).subscribe((result: ResponseDeposit) => {
        this.modalService.open(AwaitTransactionValidationComponent).dismissed.subscribe(()=>{
          this.successRecharge()
        })
        console.log(result)
        this.getAllDeposits()
      })
    } catch (error) {
      console.log(error)
    }
  }

  successRecharge(): void {
    Swal.fire('Recharge de compte réussie !')
  }

  getAllDeposits(): void {
    this.depositService.getAllTransaction().subscribe((response: ResponseTransactionList) => {
      this.loader = false;
      this.recentOrders = response.data.transactions.filter((deposit) => deposit.type === 'DEPOSIT')
      console.log(response)
    })
  }
}
