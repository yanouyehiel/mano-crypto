import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/User';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  public show: boolean = false;
  public registerForm!: FormGroup;
  public errorMessage: any;
  public user!: User;
  showDialog: boolean = false;
  public siteKey: string = environment.recaptchaSiteKey

  constructor(private fb: FormBuilder, public router: Router) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.email],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      recaptcha: ['', Validators.required]
    })
  }

  showPassword() {
    this.show = !this.show;
  }


  openModal() {
    const modalDiv = document.getElementById('myModal');
    
    if (modalDiv != null) {
      modalDiv.style.display = 'block';
    }
    
  }

  closeModal() {
    const modalDiv = document.getElementById('myModal');
    if (modalDiv != null) {
      modalDiv.style.display = 'none';
      this.router.navigate(['/pages/login'])
    }
    
  }


  register(): void {
    try {
      if (this.registerForm.controls['password'].value === this.registerForm.controls['confirmPassword'].value) {
        this.user = {
          name: this.registerForm.controls['name'].value,
          email: this.registerForm.controls['email'].value,
          password: this.registerForm.controls['password'].value,
          phoneNumber: this.registerForm.controls['phoneNumber'].value
        }
        //this.authService.register(this.user);
        this.openModal()
        console.log(this.user)
      }
    } catch (error) {
      
    }
    
  }
}
