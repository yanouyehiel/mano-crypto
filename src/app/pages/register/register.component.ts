import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/User';
import { Observable } from 'rxjs';

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
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      phoneNumber: ['', Validators.required]
    })
  }

  showPassword() {
    this.show = !this.show;
  }

  register(): void {
    //this.authService.register(this.registerForm.value);
    //this.router.navigate(['/pages/login'])
    if (this.registerForm.controls['password'].value === this.registerForm.controls['confirmPassword'].value) {
      this.user = {
        name: this.registerForm.controls['name'].value,
        email: this.registerForm.controls['email'].value,
        password: this.registerForm.controls['password'].value,
        phoneNumber: this.registerForm.controls['phoneNumber'].value
      }

      console.log(this.user)
    }
  }
}
