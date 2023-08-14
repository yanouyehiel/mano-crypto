import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  public show: boolean = false;
  public registerForm!: FormGroup;
  public errorMessage: any;

  constructor(private fb: FormBuilder, public router: Router, private authService: AuthService) {
    this.registerForm = this.fb.group({
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      passcode: ["", Validators.required],
      confirmPasscode: ["", Validators.required]
    })
  }

  showPassword() {
    this.show = !this.show;
  }

  register() {
    console.log(this.registerForm)
  }
}
