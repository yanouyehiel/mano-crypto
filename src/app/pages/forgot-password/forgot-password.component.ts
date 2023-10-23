import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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

  changePassword() {
    this.txtBtn = 'Chargement...'
    this.data.newPassword = this.passwordForm.controls['password'].value
    console.log(this.data)
    this.userService.resetPassword(this.data).subscribe((res: ResponseUser) => {
      console.log(res)
      if (res.statusCode === 1000) {
        this.txtBtn = 'Réussi'
        this.addInfoToast()
      }
    })
  }
}
