import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ResponseDeposit,
  ResponseTransactionList,
} from 'src/app/models/Transaction';
import { TransactionService } from 'src/app/services/transaction.service';
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

  confirmIdentityModal(content:any) {
   this.modalService.open(content);
  }
  public classStep1: string;
  public classStep2: string;
  public classStep3: string;
  public step!: number;
  public depositForm: FormGroup;
  private userRegistred: any = localStorage.getItem('user-mansexch');
  private userParse: any = JSON.parse(this.userRegistred);
  public recentOrders: any[] = [];
  public loader: boolean = true;


  ngOnInit(): void {
    this.step = 1;
    this.classStep1 = 'current';
    this.depositForm = this.fb.group({
      amount: ['', Validators.required],
      phoneNumber: ['', Validators.required],
    });
    this.getAllDeposits();
  }

  stepAttribute(step: number): void {
    this.step = step + 1;
    if (this.step === 1) {
      this.classStep1 = 'current';
      this.classStep2 = '';
    }
    if (this.step === 2) {
      this.classStep1 = '';
      this.classStep2 = 'current';
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
  getAllDeposits(): void {
    this.depositService
      .getAllTransaction()
      .subscribe((response: ResponseTransactionList) => {
        this.loader = false;
        this.recentOrders = response.data.transactions.filter(
          (deposit) => deposit.type === 'DEPOSIT'
        );
        console.log(this.recentOrders);
      });
  }
}
