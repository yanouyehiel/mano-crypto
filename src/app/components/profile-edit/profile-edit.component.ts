import { Component, Input, OnInit } from '@angular/core';
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

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.getProfile()  
  }

  getProfile() {
    this.userService.getProfile().subscribe((profile: ResponseProfile) => {
      console.log(profile)
      this.user = {
        id: profile.data?.user.id,
        name: profile.data?.user.name,
        email: profile.data?.user.email,
        phone: profile.data?.user.phoneNumber,
        isVerify: profile.data?.user.isPhoneNumberVerified
      }
    })
  }

  updateProfile() {
    console.log('Updated')
    this.dialog()
  }

  dialog(){
    Swal.fire({
      position: 'middle',
      icon: 'success',
      title: 'Mise à jour réussie !',
      showConfirmButton: false,
      timer: 1500
    })
  }

  onFileChanged(file: any) {
    this.files.push(file)
    //console.log(this.files)
  }
}
