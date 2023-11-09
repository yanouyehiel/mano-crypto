import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { ResponseUser } from 'src/app/models/User';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public show: boolean = false;
  public loginForm!: FormGroup;
  public error: boolean = false;
  public errorMessage: string;
  public siteKey: string = environment.recaptchaSiteKey
  public textBtn: string = 'SIGN IN'

  constructor(
    private fb: FormBuilder, 
    public router: Router, 
    public authService: AuthService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    localStorage.removeItem('token-mansexch')
    localStorage.removeItem('user-mansexch')
    localStorage.removeItem('_grecaptcha')
    localStorage.removeItem('tokenReset-mansexch')
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
      recaptcha: ['', Validators.required]
    })
  }

  showPassword() {
    this.show = !this.show;
  }

  showToast(message: string) {
    this.toast.error(message)
  }

  login() {
    try {
      this.textBtn = 'Login...'
      const data = {
        email: this.loginForm.controls['email'].value,
        password: this.loginForm.controls['password'].value
      }
      this.authService.login(data).subscribe((response: ResponseUser) => {
        console.log(response)
        if (response.statusCode == 1000) {
          const token = {
            token: response.data?.token
          }
          localStorage.setItem("token-mansexch", JSON.stringify(token));
          this.router.navigate(['/admin/home'])
        } else if (response.statusCode == 1001) {
          this.error = true;
          this.errorMessage = 'Erreur sur le serveur, veuillez réessayer svp !';
          this.textBtn = 'SIGN IN'
        }
      }, (error) => {
        this.error = true;
        this.errorMessage = error.error.message;
        this.showToast(error.error.message)
        this.textBtn = 'SIGN IN'
      })

    } catch (error) {
      console.log(error)
    }
  }
}
