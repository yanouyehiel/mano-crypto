import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ResponseDeposit } from 'src/app/models/Transaction';
import { TransactionService } from 'src/app/services/transaction.service';
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

  constructor(
    private depositService: TransactionService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.step = 1;
    this.classStep1 = 'current';
    this.depositForm = this.fb.group({
      amount: ['', Validators.required]
    })
  }

  stepAttribute(step: number): void {
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
    console.log(this.step)
  }

  addRecharge(): void {
    const data = {
      amount: parseInt(this.depositForm.controls['amount'].value),
      phoneNumber: this.userParse.user.phoneNumber
    }
    try {
      console.log(data)
      this.depositService.addDeposit(data).subscribe((result: ResponseDeposit) => {
        console.log(result)
        this.successRecharge()
      })
    } catch (error) {
      console.log(error)
    }
  }

  successRecharge(): void {
    Swal.fire('Recharge de compte réussie !')
  }
}
