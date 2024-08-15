import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
  public user: any;
  profileForm: FormGroup;
  profile: any;
  fileForm: FormGroup;
  formData: FormData;
  private userSaved = localStorage.getItem('user-mansexch')
  public loader: boolean = true;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private router: Router
  ) 
  {
    if (this.userSaved == null) {
      this.router.navigate(['/auth/login'])
    }
  }

  ngOnInit(): void {
    this.getProfileUser()
    this.profileForm = this.fb.group({
      name: ['', Validators.required]
    })
    this.fileForm = this.fb.group({
      files: ['', Validators.required]
    })
  }

  getProfileUser(): void {
    this.userService.getProfile().subscribe((response: any) => {
      this.user = response.data.user
    }, (err) => {
      if (err.status === 401) {
        this.router.navigate(['/auth/login'])
      }
    })
    this.loader = false;
  }

  updateProfile() {
    this.profile = {
      name: this.profileForm.controls['name'].value,
      phoneNumber: this.user.phoneNumber,
      email: this.user.email
    }
    
    this.userService.updateName(this.profile.name).subscribe((res: ResponseProfile) => {
      if (res.statusCode === 1000) {
        this.toast.success("Mise à jour du nom réussie !")
      }
    }, (err) => {
      if (err.status === 401) {
        this.router.navigate(['/auth/login'])
      }
    })
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

  checkFileSize(file: File): boolean {
    const maxSize = 2 * 1024 * 1024;
  
    if (file.size <= maxSize) {
      return true
    } else {
      return false
    }
  }

  encodeImageToBinary(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onloadend = () => {
        const binaryString = reader.result as string;
        resolve(binaryString);
      };
  
      reader.onerror = (error) => {
        reject(error);
      };
  
      reader.readAsBinaryString(file);
    });
  }
}
