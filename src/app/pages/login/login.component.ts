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

  public userRegistred: any = localStorage.getItem('user-mansexch');
  constructor(private fb: FormBuilder, public router: Router, public authService: AuthService) {}

  ngOnInit(): void {
    const objUSer = JSON.parse(this.userRegistred)
    if (objUSer) {
      this.router.navigate(['/dashbord'])
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
      const data = {
        email: this.loginForm.controls['email'].value,  
        password: this.loginForm.controls['password'].value
      }
      this.authService.login(data).subscribe((response: ResponseUser) => {
        console.log(response)
        const user = {
          nom: '',
          email: '',
          token: response.data?.token
        }
        localStorage.setItem("user-mansexch", JSON.stringify(user));
        this.router.navigate(['/pages/dashbord'])
      })
      
    } catch (error) {
      console.log(error)
    } 
  }
}
