import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, of } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-confirm-password',
  templateUrl: './confirm-password.component.html',
  styleUrls: ['./confirm-password.component.scss']
})
export class ConfirmPasswordComponent {
  constructor(private activatedModal: NgbActiveModal, private authService: AuthService, private fb: FormBuilder) { }
  private userRegistred: any = localStorage.getItem('user-mansexch');
  private userParse: any = JSON.parse(this.userRegistred);


  ckeckConfirmation(password: string) {
    console.log({ email: this.userParse.user.email, password: password })

    this.authService.login({ email: this.userParse.user.email, password: password }).pipe(catchError((error) => {
      return of((error.error))
    })).subscribe((value) => {
      if (value.statusCode === 1000) {
        this.activatedModal.dismiss(true);
      } else {
        this.closeModal()
      }
    })

  }
  closeModal() {
    this.activatedModal.dismiss(false)
  }
}
