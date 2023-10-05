import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-convertir-crypto-devise',
  templateUrl: './convertir-crypto-devise.component.html',
  styleUrls: ['./convertir-crypto-devise.component.scss']
})
export class ConvertirCryptoDeviseComponent  implements OnInit{

  constructor(private formBuilder:FormBuilder){}

  convertForm:FormGroup


  ngOnInit(): void {
    this.convertForm = this.formBuilder.group({
      amount: ['', Validators.required],
      crypto: ['', Validators.required],
    });
  }


  get layoutClass() {
    return
      // this.layoutService.config.settings.sidebar_type +
      // ' ' +
      // this.layoutService.config.settings.layout.replace('layout', 'sidebar')

  }

  getAllBuyCrypto(): any {}
  public earningData = [
    {
      id: 1,
      classCompo: 'bg-primary',
      icon: 'database',
      title: 'Fcfa XAF',
      count: '56850'
    },
    {
      id: 2,
      classCompo: 'bg-secondary',
      icon: 'shopping-bag',
      title: 'USD USA',
      count: '56850'
    }
  ];



}
