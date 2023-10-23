import { Component,Input } from '@angular/core';

@Component({
  selector: 'app-await-transaction-validation',
  templateUrl: './await-transaction-validation.component.html',
  styleUrls: ['./await-transaction-validation.component.scss']
})
export class AwaitTransactionValidationComponent {
  @Input() provider:String

}
