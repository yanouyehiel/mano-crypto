import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, of } from 'rxjs';
import { ResponseParent } from 'src/app/models/Transaction';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent {
  @Output() filesUploaded: EventEmitter<FormData> = new EventEmitter<FormData>();
  @Input() kyc: any[]
  cniFile?: File;
  cniPersonFile?: File;
  public isDisabled: boolean;
  public isLoading: boolean;
  public formData: FormData = new FormData();

  public dropzoneConfig: any = {
    acceptedFiles: 'image/*',
    maxFiles: 2,
    clickable: true,
    autoReset: null,
    errorReset: null,
    errorFallback: null,
    previewTemplate: '<div style="display:none"></div>',
  };
  constructor(private userService: UserService, private toast: ToastrService) { }

  onSelect(key: string, event: any) {
    if (key == 'cni') {
      this.cniFile = event.addedFiles[0]
      if(this.cniFile!.size>(2 * 1024 * 1024)){
        this.isDisabled = true;
      }else{
        this.isDisabled = false;
      }
      this.formData.append(key, this.cniFile!, `${URL.createObjectURL(this.cniFile!)}.${this.cniFile!.type.split('/')[1]}`)
      
    } else {
      this.cniPersonFile = event.addedFiles[0]
      if(this.cniPersonFile!.size>(2 * 1024 * 1024)){
        this.isDisabled = true;
      }else{
        this.isDisabled = false;
      }
      this.formData.append(key, this.cniPersonFile!, `${URL.createObjectURL(this.cniPersonFile!)}.${this.cniPersonFile!.type.split('/')[1]}`)
    }
  }

 

  onSubmitKyc() {
    this.isLoading = true
    this.userService.submitKyc(this.formData).pipe(catchError((error) => of(error.error))).subscribe((response: ResponseParent) => {
      console.log(response)
      if (response.statusCode === 1000) {
        this.toast.success('Fichier envoyé');
      } else {
        this.toast.error(response.message)
      }
      this.isLoading = false;
    })
  }

}
