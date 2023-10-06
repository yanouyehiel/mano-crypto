import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-enter-email',
  templateUrl: './enter-email.component.html',
  styleUrls: ['./enter-email.component.scss']
})
export class EnterEmailComponent implements OnInit {
  public emailForm: FormGroup
  
  constructor(
    private modal: NgbModal,
    private fb: FormBuilder) {}

  ngOnInit(): void {
    this.emailForm = this.fb.group({
      email: ['', [Validators.email, Validators.required]]
    })
  }

  openModal(content: any) {
    this.modal.open(content)
  }

  formSubmit(content: any): void {
    console.log(this.emailForm.controls['email'].value)
    this.openModal(content)
  }
}
