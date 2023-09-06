import { Component } from '@angular/core';

@Component({
  selector: 'app-confirm-login',
  templateUrl: './confirm-login.component.html',
  styleUrls: ['./confirm-login.component.scss']
})
export class ConfirmLoginComponent {
  public typeConfirm: string = 'email'

  constructor() {}
}
