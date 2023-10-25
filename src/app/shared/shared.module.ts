import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { AdminComponent } from './components/layout/admin/admin.component';
import { ModeComponent } from './components/header/mode/mode.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavService } from '../services/nav.service';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { SortableDirective } from './directives/sortable.directive';
import { ConfirmPasswordComponent } from './components/confirm-password/confirm-password.component';
import { SelectCryptoModalComponent } from './components/select-crypto-modal/select-crypto-modal.component';
import { AwaitTransactionValidationComponent } from './components/await-transaction-validation/await-transaction-validation.component';
import { SidebarAdminComponent } from './components/sidebar-admin/sidebar-admin.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    ModeComponent,
    SortableDirective,
    ConfirmPasswordComponent,
    SelectCryptoModalComponent,
    AwaitTransactionValidationComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    TranslateModule.forRoot()
  ],
  providers: [NavService, DecimalPipe],
  exports: [
    RouterModule,
    NgbModule,
    TranslateModule,
  ]
})
export class PagesModule { }
