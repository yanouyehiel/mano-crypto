import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-confirm-login',
  templateUrl: './confirm-login.component.html',
  styleUrls: ['./confirm-login.component.scss']
})
export class ConfirmLoginComponent implements OnInit {
  public typeConfirm: string = 'email'
  public verifyCodeForm!: FormGroup;
  private dataUser: any = {
    email: '',
    otpCode: ''
  }
  public error: number = 0;
  public textBtn: string = 'Confirmer';
  public isClicked: boolean = false

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.verifyCodeForm = this.fb.group({
      codeValue: ['', Validators.required]
    })
    this.activatedRoute.params.subscribe((data: any) => {
        this.dataUser.email = data['email']
      }
    )
  }

  estConstitueeDeChiffres(chaine: string): boolean {
    const expressionReguliere = /^\d+$/; 
    return expressionReguliere.test(chaine);
  }

  showToast(message: string) {
    this.toast.error(message)
  }

  verifyCode() {
    this.isClicked = true
    this.textBtn = 'Confirmation en cours...'
    const code = this.verifyCodeForm.controls['codeValue'].value
    if (code.length == 6 && this.estConstitueeDeChiffres(code)) {
      this.dataUser.otpCode = this.verifyCodeForm.controls['codeValue'].value
      this.authService.verifyUser(this.dataUser).subscribe((response: any) => {
        if (response.statusCode === 1004) {
          this.error = response.statusCode
        } else if (response.statusCode === 1000) {
          this.error = response.statusCode
          this.router.navigate(['/auth/login'])
        }
      })
    } else {
      this.showToast("Le code ne doit contenir que des chiffres")
      this.textBtn = "Confirmer"
    }
    
  }
}
