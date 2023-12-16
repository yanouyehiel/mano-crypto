import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ResponseUser } from 'src/app/models/User';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-enter-email',
  templateUrl: './enter-email.component.html',
  styleUrls: ['./enter-email.component.scss']
})
export class EnterEmailComponent implements OnInit {
  public emailForm: FormGroup
  public response: number
  public textBtn: string = 'Envoyer'
  
  constructor(
    private modal: NgbModal,
    private fb: FormBuilder,
    private userService: UserService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.emailForm = this.fb.group({
      email: ['', [Validators.email, Validators.required]]
    })
  }

  openModal(content: any) {
    this.modal.open(content)
  }

  showToast(message: string) {
    this.toast.error(message)
  }

  formSubmit(content: any): void {
    this.textBtn = 'Traitement...'
    const data = {
      email: this.emailForm.controls['email'].value
    }
    this.userService.askResetPassword(data)
    .subscribe((res: ResponseUser) => {
      console.log(res)
      localStorage.setItem('tokenReset-mansexch', JSON.stringify(res.data?.token))
      this.response = res.statusCode
      this.textBtn = 'Success'
      this.openModal(content)
    }, (error) => {
      this.textBtn = 'Envoyer'
      this.showToast(error.error.message)
    })
  }
}
