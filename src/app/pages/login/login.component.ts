import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { ResponseUser } from 'src/app/models/User';

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

  constructor(private fb: FormBuilder, public router: Router, public authService: AuthService) {}

  ngOnInit(): void {
    localStorage.removeItem('token-mansexch')
    localStorage.removeItem('user-mansexch')
    localStorage.removeItem('_grecaptcha')
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
      recaptcha: ['', Validators.required]
    })
  }
  
  showPassword() {
    this.show = !this.show;
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
        if (response.data) {
          const token = {
            token: response.data?.token
          }
          localStorage.setItem("token-mansexch", JSON.stringify(token));
          this.router.navigate(['/client/home'])
        } else {
          this.error = true;
          this.errorMessage = response.message;
        }
        
      })
      
    } catch (error) {
      console.log(error)
    } 
  }
}
