import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ResponseEmail, ResponseUser, User } from 'src/app/models/User';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2'
import { Country } from 'src/app/models/Country';
import { countries } from 'src/app/models/Country';
import { error } from 'console';
import { ToastrService } from 'ngx-toastr';

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
  public returnedValue: any = {
    statusCode: 0,
    message: '',
    data: {
      token: ''
    }
  }
  public textBtn: string
  public countries: Country[] = countries;
  public selectedCountry?: Country;
  public selectDiv:HTMLElement | null
  public isClicked: boolean = false
  public passwordIsCorrect: boolean = false

  constructor(
    private fb: FormBuilder, 
    public router: Router, 
    public authService: AuthService,
    private toast: ToastrService
  ) {
  }
  handle(selectedCountry:any){
    this.selectedCountry = selectedCountry;

  }

  ngOnInit(): void {
    this.selectDiv  = document.getElementById("countrySelector");
    localStorage.removeItem('token-mansexch')
    localStorage.removeItem('user-mansexch')
    localStorage.removeItem('_grecaptcha')
    localStorage.removeItem('tokenReset-mansexch')
    this.textBtn = "S'INSCRIRE"
    this.selectedCountry = countries.find((e)=>e.dial_code == "+237")
    // selectDiv!.innerText = this.selectedCountry!.name
    // this.selectDiv?.firstChild?.firstChild?.lastChild?.firstChild?.nodeValue?.replace('',this.selectedCountry!.name)
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.email],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      //codePays: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      recaptcha: ['', Validators.required]
    })
  }

  onCountryChange(selectedValue: Country) {
    this.selectedCountry = selectedValue;
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

  showToast(message: string) {
    this.toast.error(message)
  }

  verifierMotDePasse(motDePasse: string): boolean {
    const aDesChiffres = /\d/.test(motDePasse);
    const aDesLettresMajuscules = /[A-Z]/.test(motDePasse);
    const aDesCaracteresSpeciaux = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(motDePasse);
  
    const toutesLesContraintesSontVerifiees = 
      aDesChiffres &&
      aDesLettresMajuscules &&
      aDesCaracteresSpeciaux &&
      motDePasse.length >= 8;
    
    return toutesLesContraintesSontVerifiees;
  }  


  register(): void {
    this.isClicked = true
    this.passwordIsCorrect = this.verifierMotDePasse(this.registerForm.controls['password'].value)
    if (this.passwordIsCorrect) {
      if (this.registerForm.controls['password'].value.length < 8 || this.registerForm.controls['confirmPassword'].value.length < 8) {
        this.toast.error("Les mots de passe doivent avoir au moins 8 caractères")
      } else {
        if (this.registerForm.controls['password'].value === this.registerForm.controls['confirmPassword'].value) {
          this.user = {
            name: this.registerForm.controls['name'].value,
            email: this.registerForm.controls['email'].value,
            password: this.registerForm.controls['password'].value,
            countryCode: this.selectedCountry!.dial_code,
            country: this.selectedCountry!.name,
            phoneNumber: this.registerForm.controls['phoneNumber'].value
          }
          
          this.textBtn = 'Chargement...'
          try {
            this.authService.register(this.user).subscribe((response: ResponseUser) => {
    
              this.returnedValue = {
                statusCode: response.statusCode,
                message: response.message,
                data: {
                  token: response.data?.token
                }
              }
              localStorage.setItem('token-mansexch', JSON.stringify(this.returnedValue.data))
              if (this.returnedValue.statusCode == 1000) {
                this.router.navigate([`/auth/confirm-login/${this.user.email}`])
              }     
            }, (error) => {
              this.showToast(error.error.message)
              this.textBtn = "S'INSCRIRE"
              this.returnedValue = {
                statusCode: error.error.statusCode,
                message: error.error.message
              }
            });
    
            /*const data = {
              receiver_email: this.user.email
            }
            this.authService.sendEmailCode(data).subscribe((response: ResponseEmail) => {
              this.returnedValue.statusCode = response.statusCode
            })
    
            if (this.returnedValue.statusCode === 1000) {
              this.openModal('myModal')
            }*/
          } catch (error) {
          }
        } else {
          this.toast.error("Les mots de passe ne correspondent pas.")
        }
      }
    }
    
  }
}
