import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SelectCryptoModalComponent } from 'src/app/shared/components/select-crypto-modal/select-crypto-modal.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-convertir-crypto-devise',
  templateUrl: './convertir-crypto-devise.component.html',
  styleUrls: ['./convertir-crypto-devise.component.scss']
})
export class ConvertirCryptoDeviseComponent  implements OnInit{

  constructor(private formBuilder:FormBuilder,private modalService:NgbModal){}
 public crypto1={
    symbol: "ETH",
    name: "Ethereum",
    icon: "../../../../assets/currencies/eth.svg",
  };
public crypto2 = {
    symbol: "AAVE",
    name: "AAVE",
    icon: "../../../../assets/currencies/aave.svg",
  }
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

  cryptoList =  [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      icon: '../../../../assets/currencies/btc.svg',
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      icon: '../../../../assets/currencies/eth.svg',
    },
    {
      symbol: 'AAVE',
      name: 'AAVE',
      icon: '../../../../assets/currencies/aave.svg',
    },
  ];
  ngOnInit(): void {

  }

 

  success(){
    Swal.fire('Success', "Vous avez converti vos fonds ?", 'success');
  }

  reverse(){
    let cryp = this.crypto1;
    this.crypto1 = this.crypto2;
    this.crypto2 = cryp
  }

  selectCrypto1(crypto:any){
   let modalRef = this.modalService.open(SelectCryptoModalComponent,{ size: 'sm', scrollable:true })
   modalRef.componentInstance.listItems = this.cryptoList
  modalRef.closed.subscribe((res)=>{
    this.crypto1 = res
  })
  }
  selectCrypto2(crypto:any){
    let modalRef = this.modalService.open(SelectCryptoModalComponent,{ size: 'sm', scrollable:true })
    modalRef.componentInstance.listItems = this.cryptoList
   modalRef.closed.subscribe((res)=>{
     this.crypto2 = res
   })
   }
}
