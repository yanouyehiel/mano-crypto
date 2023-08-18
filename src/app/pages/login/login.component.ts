import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { environment } from 'src/environments/environment';

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

  constructor(private fb: FormBuilder, public router: Router) {}

  ngOnInit(): void {
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
      const data = {
        email: this.loginForm.controls['email'].value,
        password: this.loginForm.controls['password'].value
      }
      //this.authService.login(data)
      console.log(data)
      this.router.navigate(['/pages/dashbord'])
    } catch (error) {
      console.log(error)
    } 
  }
}
