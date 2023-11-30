import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent {
  @Output() filesUploaded: EventEmitter<File[]> = new EventEmitter<File[]>();
  files: File[] = [];

  onSelect(event: any) {
    this.files.push(...event.addedFiles);
    this.filesUploaded.emit(this.files)
  }

  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
    this.filesUploaded.emit(this.files)
  }
}
