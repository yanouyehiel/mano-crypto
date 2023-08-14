import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  public show: boolean = false;
  public loginForm!: FormGroup;
  public errorMessage: any;

  constructor(private fb: FormBuilder, public router: Router) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required]
    })
  }

  showPassword() {
    this.show = !this.show;
  }

  login() {

  }
}
