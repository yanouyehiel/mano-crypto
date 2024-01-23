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
  @Input() files: any[] = [];
  profileForm: FormGroup;
  profile: any;
  fileForm: FormGroup;
  formData: FormData;
  private userSaved = localStorage.getItem('user-mansexch')

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
    this.user = JSON.parse(localStorage.getItem('user-mansexch')!).user
    this.profileForm = this.fb.group({
      name: ['', Validators.required]
    })

    this.fileForm = this.fb.group({
      files: ['', Validators.required]
    })
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
    }, (error: any) => {
      if (error.error.statusCode === 1001) {
        this.toast.error(error.error.message)
      } else if (error.error.statusCode === 1005) {
        this.toast.error(error.error.message)
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

  onFileChanged(file: any) {
    this.files.push(file)
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
