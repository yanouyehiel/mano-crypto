import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ProfileUser, ResponseProfile } from 'src/app/models/User';
import { UserService } from 'src/app/services/user.service';
const Swal = require('sweetalert2')

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {
  public user: ProfileUser;
  @Input() files: File[] = [];
  profileForm: FormGroup;
  profile: any;

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user-mansexch')!).user
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      files: ['', Validators.required]
    })
  }



  updateProfile() {
    console.log('Updated')
    this.profile = {
      name: this.user.name,
      phoneNumber: this.user.phone,
      email: this.user.email,
      files: this.files
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
    //console.log(this.files)
  }
}
