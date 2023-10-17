import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-select-crypto-modal',
  templateUrl: './select-crypto-modal.component.html',
  styleUrls: ['./select-crypto-modal.component.scss'],
})
export class SelectCryptoModalComponent implements OnInit{
  constructor(private activatedModal: NgbActiveModal){}
  listItems:any[]

  ngOnInit(): void {
      
    console.log(this.listItems)
  }
  setSelected(crypto:any){
    this.activatedModal.close(crypto)
  }
 
 closeIcon(){
  this.activatedModal.dismiss('Cross click')
 }

 

}
