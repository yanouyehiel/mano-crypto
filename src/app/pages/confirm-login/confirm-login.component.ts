import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-confirm-login',
  templateUrl: './confirm-login.component.html',
  styleUrls: ['./confirm-login.component.scss']
})
export class ConfirmLoginComponent implements OnInit {
  public typeConfirm: string = 'email'
  public verifyCodeForm!: FormGroup;
  private dataUser: any = {
    email: '',
    otpCode: ''
  }
  public error: number = 0;
  public textBtn: string = 'Confirmer';

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.verifyCodeForm = this.fb.group({
      codeValue: ['', Validators.required]
    })
    this.activatedRoute.params.subscribe((data: any) => {
        this.dataUser.email = data['email']
      }
    )
  }

  verifyCode() {
    this.textBtn = 'Confirmation en cours...'
    this.dataUser.otpCode = this.verifyCodeForm.controls['codeValue'].value
    console.log(this.dataUser)
    this.authService.verifyUser(this.dataUser).subscribe((response: any) => {
      console.log(response)
      if (response.statusCode === 1004) {
        this.error = response.statusCode
      } else if (response.statusCode === 1000) {
        this.error = response.statusCode
        this.router.navigate(['/auth/login'])
      }
    })
  }
}
