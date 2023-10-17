import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { ClientComponent } from './components/layout/client/client.component';
import { AdminComponent } from './components/layout/admin/admin.component';
import { NotificationComponent } from './components/header/notification/notification.component';
import { ModeComponent } from './components/header/mode/mode.component';
import { FeatherIconsComponent } from './components/feather-icons/feather-icons.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavService } from '../services/nav.service';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { ChatComponent } from './components/header/chat/chat.component';
import { MaximizeComponent } from './components/header/maximize/maximize.component';
import { SearchComponent } from './components/header/search/search.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { UserInfoComponent } from './components/sidebar/user-info/user-info.component';
import { FooterComponent } from './components/footer/footer.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { AddCryptoComponent } from '../components/add-crypto/add-crypto.component';
import { SortableDirective } from './directives/sortable.directive';
import { SelectCryptoModalComponent } from './components/select-crypto-modal/select-crypto-modal.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AdminComponent,
    ModeComponent,
    SortableDirective,
    SelectCryptoModalComponent
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
    AdminComponent,
    NgbModule,
    TranslateModule
  ]
})
export class PagesModule { }
