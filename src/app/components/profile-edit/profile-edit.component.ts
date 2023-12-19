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
  @Input() files: any[] = [];
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

  checkFileSize(file: File): Promise<void> {
    const maxSize = 2 * 1024 * 1024;
  
    return new Promise((resolve, reject) => {
      if (file.size <= maxSize) {
        resolve();
      } else {
        reject(this.toast.error("La taille des 2 fichiers ne doit pas dépasser 2 Mo"));
      }
    });
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

  uploadFiles(): void {
    if (this.files[0].length === 2) {
      const promises: Promise<string>[] = [];
      
      this.files.forEach((fileArray: File[]) => {
        fileArray.forEach((file: File) => {
          const promise = this.checkFileSize(file)
          .then(() => this.encodeImageToBinary(file));
          promises.push(promise);
        });
      });
  
      Promise.all(promises)
        .then((binaryStrings: string[]) => {
          const data = {
            cni: binaryStrings[0],
            cni_person: binaryStrings[1]
          };
          console.log(data)
  
          this.userService.submitKyc(data).subscribe((res: ResponseEmail) => {
            console.log(res);
          }, (error: any) => {
            console.log(error)
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
          });
        })
        .catch((error) => {
          this.toast.error("Erreur d'encodage, veuillez réessayer !")
        });
    } else {
      this.toast.error("Veuillez insérer 2 fichiers");
    }
  }
}
