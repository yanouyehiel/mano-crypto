import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { privateDecrypt } from 'crypto';
import { ResponseUser } from 'src/app/models/User';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  public show: boolean = false;
  public passwordForm: FormGroup
  private data: any = {
    otpSecret: '',
    otpCode: '',
    newPassword: ''
  }

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private modal: NgbModal
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const user = params['user'];
      const code = params['code'];
      console.log('User:', user);
      console.log('Code:', code);
      this.data.otpSecret = code
      this.data.otpCode = user
    })
    this.passwordForm = this.fb.group({
      password: ['', [Validators.minLength(8), Validators.required]]
    })
    this.changePassword()
  }
  
  openModal(content: any) {
    this.modal.open(content)
  }

  showPassword() {
    this.show = !this.show;
  }

  changePassword() {
    this.data.newPassword = this.passwordForm.controls['password'].value
    console.log(this.data)
    /*this.userService.resetPassword(this.data).subscribe((res: ResponseUser) => {

    })*/
  }
}
