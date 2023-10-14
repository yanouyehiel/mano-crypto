import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-password',
  templateUrl: './confirm-password.component.html',
  styleUrls: ['./confirm-password.component.scss']
})
export class ConfirmPasswordComponent {
  constructor(private activatedModal: NgbActiveModal){}
  private userRegistred: any = localStorage.getItem('user-mansexch');
  private userParse: any = JSON.parse(this.userRegistred);

  ckeckConfirmation(){
    //TODO - check authentification
    console.log(this.userParse.user)
    console.log(this.userParse)
    console.log(!this.userParse.user.isPhoneNumberVerified)
    if(!this.userParse.user.isPhoneNumberVerified){
      // this.phoneNotActive()
    }else{
      // this.success()
    }
    this.activatedModal.dismiss(true);
  }
  closeModal(){
    this.activatedModal.dismiss(false)
  }
}
