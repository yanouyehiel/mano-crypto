import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ResponseEmail, ResponseUser, User } from 'src/app/models/User';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2'
import { Country } from 'src/app/models/Country';
import { countries } from 'src/app/models/Country';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  public show: boolean = false;
  public registerForm!: FormGroup;
  public user!: User;
  public showDialog: boolean = false;
  public siteKey: string = environment.recaptchaSiteKey
  public returnedValue: ResponseUser = {
    statusCode: 0,
    message: '',
    data: {
      token: ''
    }
  }
  public textBtn: string = "S'INSCRIRE"
  public countries: Country[] = countries;
  public selectedCountry: any;

  constructor(
    private fb: FormBuilder, 
    public router: Router, 
    public authService: AuthService
  ) {
    //this.selectedCountry.valueChanges.subscribe(value => console.log(value));
  }

  ngOnInit(): void {
    localStorage.removeItem('token-mansexch')
    localStorage.removeItem('user-mansexch')
    localStorage.removeItem('_grecaptcha')
    localStorage.removeItem('tokenReset-mansexch')
    
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.email],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      codePays: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      recaptcha: ['', Validators.required]
    })
  }

  onCountryChange(selectedValue: any) {
    this.selectedCountry = selectedValue.dial_code;
    console.log(this.selectedCountry)
  }

  showPassword() {
    this.show = !this.show;
  }

  openModal(id: string) {
    const modalDiv = document.getElementById(id);
    
    if (modalDiv != null) {
      modalDiv.style.display = 'block';
    }
    
  }

  closeModal() {
    const modalDiv = document.getElementById('myModal');
    if (modalDiv != null) {
      modalDiv.style.display = 'none';
      this.router.navigate([`/auth/confirm-login/${this.user.email}`])
    }
    
  }

  getFlagCountry(code: string): string {
    code = code.toLowerCase()
    const url: string = `https://assets.iqonic.design/old-themeforest-images/prokit/images/flags/${code}.png`
    return url
  }

  info() {
    /*Swal.fire(
      'Info',
      '<p>Bonjour tout le monde</p>',
      'info'
    )*/
    Swal.fire('Hello World')
  }


  register(): void {
    this.textBtn = 'Chargement...'
    if (this.registerForm.controls['password'].value === this.registerForm.controls['confirmPassword'].value) {
      this.user = {
        name: this.registerForm.controls['name'].value,
        email: this.registerForm.controls['email'].value,
        password: this.registerForm.controls['password'].value,
        countryCode: this.registerForm.controls['codePays'].value,
        phoneNumber: this.registerForm.controls['phoneNumber'].value
      }
    }
    console.log(this.user)
    /*try {
      this.authService.register(this.user).subscribe((response: ResponseUser) => {

        this.returnedValue = {
          statusCode: response.statusCode,
          message: response.message,
          data: {
            token: response.data?.token
          }
        }
        console.log(this.returnedValue);      
      });

      const data = {
        receiver_email: this.user.email
      }
      this.authService.sendEmailCode(data).subscribe((response: ResponseEmail) => {
        console.log(response)
        this.returnedValue.statusCode = response.statusCode
      })

      if (this.returnedValue.statusCode === 1000) {
        this.openModal('myModal')
      }
      this.router.navigate([`/auth/confirm-login/${this.user.email}`])
    } catch (error) {
      console.log(error)
    }*/
    
  }
}
