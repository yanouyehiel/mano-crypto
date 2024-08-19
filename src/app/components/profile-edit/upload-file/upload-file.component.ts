import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { error } from 'console';
import { ToastrService } from 'ngx-toastr';
import { catchError, of } from 'rxjs';
import { ResponseParent } from 'src/app/models/Transaction';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent implements OnInit {
  @Output() filesUploaded: EventEmitter<FormData> = new EventEmitter<FormData>();
  @Input() kyc: any[]
  cniRecto?: File;
  cniVerso?: File;
  userPicture?: File;
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

  constructor(private userService: UserService, private toast: ToastrService) {}

  ngOnInit(): void {
  }

  onSelect(key: string, event: any) {
    if (key == 'cni_recto') {
      this.cniRecto = event.addedFiles[0]
      if(this.cniRecto!.size>(2 * 1024 * 1024)){
        this.isDisabled = true;
      }else{
        this.isDisabled = false;
      }
      this.formData.append(key, this.cniRecto!, `${URL.createObjectURL(this.cniRecto!)}.${this.cniRecto!.type.split('/')[1]}`)
      
    } else if (key == 'cni_verso') {
      this.cniVerso = event.addedFiles[0]
      if(this.cniVerso!.size>(2 * 1024 * 1024)){
        this.isDisabled = true;
      }else{
        this.isDisabled = false;
      }
      this.formData.append(key, this.cniVerso!, `${URL.createObjectURL(this.cniVerso!)}.${this.cniVerso!.type.split('/')[1]}`)
      
    } else if (key == 'user_picture') {
      this.userPicture = event.addedFiles[0]
      if(this.userPicture!.size>(2 * 1024 * 1024)){
        this.isDisabled = true;
      }else{
        this.isDisabled = false;
      }
      this.formData.append(key, this.userPicture!, `${URL.createObjectURL(this.userPicture!)}.${this.userPicture!.type.split('/')[1]}`)
    }
  }

  

  onSubmitKyc() {
    this.isLoading = true
    if (this.cniRecto && this.cniVerso && this.userPicture) {
      this.userService.submitKyc(this.formData).pipe(catchError((error) => of(error.error))).subscribe((response: ResponseParent) => {
      
        if (response.statusCode === 1000) {
          this.toast.success('Photos envoyées, vous serrez notifié !');
          let localStorageUser = JSON.parse(localStorage.getItem('user-mansexch')!)
          if(this.cniRecto){
            this.kyc[this.kyc.indexOf(this.kyc.find((e)=>e.document_type=='cni_recto'))].status = 'submitted'
          }
          if(this.cniVerso){
            this.kyc[this.kyc.indexOf(this.kyc.find((e)=>e.document_type=='cni_verso'))].status = 'submitted'
          }
          if(this.userPicture){
            this.kyc[this.kyc.indexOf(this.kyc.find((e)=>e.document_type=='user_picture'))].status = 'submitted'
          }
          localStorageUser.user.kyc = this.kyc
          localStorage.setItem('user-mansexch', JSON.stringify(localStorageUser))
        } else {
          this.toast.error(response.message)
        }
      }, (err) => {
        console.log(err)
      })
    } else {
      this.toast.error("Veuillez toutes les photos")
    }
    this.isLoading = false;
  }

}
