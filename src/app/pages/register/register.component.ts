import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/User';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  public show: boolean = false;
  public registerForm!: FormGroup;
  public errorMessage: any;
  public user!: User;

  constructor(private fb: FormBuilder, public router: Router) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.email],
      passcode: ['', Validators.required],
      confirmPasscode: ['', Validators.required]
    })
  }

  showPassword() {
    this.show = !this.show;
  }

  register() {
    console.log(this.registerForm.value)
  }
}
