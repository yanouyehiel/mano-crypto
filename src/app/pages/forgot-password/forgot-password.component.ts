import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { error } from 'console';
import { ToastrService } from 'ngx-toastr';
import { ResponseUser } from 'src/app/models/User';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  public show: boolean = false;
  public passwordForm: FormGroup
  private data: any = { 
    otpSecret: '',
    otpCode: '',
    newPassword: ''
  }
  public txtBtn: string = 'Enregistrer';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private toastService: ToastrService
  ) { }

  ngOnInit(): void {
    const user = this.route.snapshot.queryParamMap.get('user');
    const code = this.route.snapshot.queryParamMap.get('code');
    
    this.data.otpSecret = code
    this.data.otpCode = user
    
    this.passwordForm = this.fb.group({
      password: ['', [Validators.minLength(8), Validators.required]]
    }) 
    console.log(this.data)
  }

  addInfoToast() {
    this.toastService.info('Mot de passe modifié !');
 }

  showPassword() {
    this.show = !this.show;
  }

  showToast(message: string) {
    this.toastService.error(message)
  }

  verifierMotDePasse(motDePasse: string): boolean {
    const aDesChiffres = /\d/.test(motDePasse);
    const aDesLettresMajuscules = /[A-Z]/.test(motDePasse);
    const aDesCaracteresSpeciaux = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(motDePasse);
  
    const toutesLesContraintesSontVerifiees = 
      aDesChiffres &&
      aDesLettresMajuscules &&
      aDesCaracteresSpeciaux;
    
    return toutesLesContraintesSontVerifiees;
  }

  changePassword() {
    this.txtBtn = 'Chargement...'
    this.data.newPassword = this.passwordForm.controls['password'].value
    //console.log(this.data)
    if (this.verifierMotDePasse(this.data.newPassword)) {
      this.userService.resetPassword(this.data).subscribe((res: ResponseUser) => {
        console.log(res)
        if (res.statusCode === 1000) {
          this.txtBtn = 'Réussi'
          this.addInfoToast()
        }
      }, (error) => {
        this.txtBtn = 'Enregistrer'
        this.showToast(error.error.message)
      })
    } else {
      this.txtBtn = 'Enregistrer'
      this.showToast("Le mot de passe doit contenir au moins une lettre majuscule, un chiffre et un caractère spécial")
    }
    
  }
}
