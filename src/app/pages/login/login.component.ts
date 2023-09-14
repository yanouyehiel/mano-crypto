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
  public errorMessage: any;
  public siteKey: string = environment.recaptchaSiteKey
  public textBtn: string = 'SIGN IN'

  public tokenRegistred: any = localStorage.getItem('token-mansexch');
  constructor(private fb: FormBuilder, public router: Router, public authService: AuthService) {}

  ngOnInit(): void {
    const objToken = JSON.parse(this.tokenRegistred)
    if (objToken) {
      this.router.navigate(['/'])
    } else {
      this.loginForm = this.fb.group({
        email: ["", [Validators.required, Validators.email]],
        password: ["", Validators.required],
        recaptcha: ['', Validators.required]
      })
    }
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
        const token = {
          token: response.data?.token
        }
        localStorage.setItem("token-mansexch", JSON.stringify(token));
        this.router.navigate(['/client/home'])
      })
      
    } catch (error) {
      console.log(error)
    } 
  }
}
