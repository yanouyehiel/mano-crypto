import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-convertir-crypto-devise',
  templateUrl: './convertir-crypto-devise.component.html',
  styleUrls: ['./convertir-crypto-devise.component.scss']
})
export class ConvertirCryptoDeviseComponent  implements OnInit{

  constructor(private formBuilder:FormBuilder){}

  convertForm:FormGroup = this.formBuilder.group({
    amount: ['', Validators.required],
    crypto: ['BTC', Validators.required],
  });
  public earningData = [
    {
      id: 1,
      classCompo: 'bg-primary',
      icon: 'database',
      title: 'Fcfa XAF',
      count: '9000'
    },
    {
      id: 2,
      classCompo: 'bg-success',
      icon: 'shopping-bag',
      title: 'USDT USA',
      count: '40'
    }
  ];

  ngOnInit(): void {

  }


  getAllBuyCrypto(){
    console.table(this.convertForm);
  }

  success(){
    Swal.fire('Success', "Vous avez converti vos fonds ?", 'success');
  }



}
