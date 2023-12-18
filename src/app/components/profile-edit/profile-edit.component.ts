import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProfileUser, ResponseEmail, ResponseProfile } from 'src/app/models/User';
import { UserService } from 'src/app/services/user.service';
const Swal = require('sweetalert2')

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {
  public user: ProfileUser;
  @Input() files: any[2] = [];
  profileForm: FormGroup;
  profile: any;
  fileForm: FormGroup

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user-mansexch')!).user

    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    })

    this.fileForm = this.fb.group({
      files: ['', Validators.required]
    })
  }

  updateProfile() {
    console.log('Updated')
    this.profile = {
      name: this.user.name,
      phoneNumber: this.user.phone,
      email: this.user.email
    }
    console.log(this.profile)
    this.dialog()
  }

  dialog(){
    Swal.fire({
      position: 'middle',
      icon: 'success',
      title: 'Mise à jour réussie !',
      showConfirmButton: false,
      timer: 2000
    })
  }

  onFileChanged(file: any) {
    this.files.push(file)
  }

  uploadFiles(): void {
    const files = this.files
    const data = {
      cni: '',
      cni_person: ''
    }
    
    data.cni = files[0][0].name
    data.cni_person = files[0][1].name
    console.log(data)

    this.userService.submitKyc(data).subscribe((res: ResponseEmail) => {
      console.log(res)
      
    }, (error: any) => {
      if (error.error.statusCode === 200) {
        this.toast.info(error.error.message)
      } else if (error.error.statusCode === 400) {
        this.toast.error(error.error.message)
      } else if (error.error.statusCode === 401) {
        this.toast.error(error.error.message)
      } else if (error.error.statusCode === 500) {
        this.toast.error(error.error.message)
      } else if (error.error.statusCode === 1004) {
        this.toast.error(error.error.message)
      }
    })
  }
}
