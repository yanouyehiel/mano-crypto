import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationComponent } from './pages/validation/validation.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { DialogComponent } from './components/dialog/dialog.component';
import { NgxCaptchaModule } from 'ngx-captcha'
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './shared/components/header/header.component';
import { FeatherIconsComponent } from './shared/components/feather-icons/feather-icons.component';
import { ModeComponent } from './shared/components/header/mode/mode.component';
import { NotificationComponent } from './shared/components/header/notification/notification.component';
import { ClientComponent } from './shared/components/layout/client/client.component';
import { AdminComponent } from './shared/components/layout/admin/admin.component';
import { ChatComponent } from './shared/components/header/chat/chat.component';
import { MaximizeComponent } from './shared/components/header/maximize/maximize.component';
import { SearchComponent } from './shared/components/header/search/search.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { UserInfoComponent } from './shared/components/sidebar/user-info/user-info.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { BreadcrumbComponent } from './shared/components/breadcrumb/breadcrumb.component';
import { AddCryptoComponent } from './components/add-crypto/add-crypto.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { ConfirmLoginComponent } from './pages/confirm-login/confirm-login.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { HomeComponent } from './components/home/home.component';
import { RechargeCompteComponent } from './components/recharge-compte/recharge-compte.component';
import { MyListingComponent } from './components/my-listing/my-listing.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ProfileFinanceComponent } from './components/home/profile-finance/profile-finance.component';
import { VariationCryptoComponent } from './components/home/variation-crypto/variation-crypto.component'
import { NgApexchartsModule } from 'ng-apexcharts';
import { ProfileEditComponent } from './components/profile-edit/profile-edit.component';
import { UploadFileComponent } from './components/profile-edit/upload-file/upload-file.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { RetirerFondsComponent } from './components/retirer-fonds/retirer-fonds.component';

import { ConvertirCryptoDeviseComponent } from './components/convertir-crypto-devise/convertir-crypto-devise.component';

import { EnterEmailComponent } from './pages/enter-email/enter-email.component';
import { SendCryptoComponent } from './components/send-crypto/send-crypto.component';
import { TauxDeChangeComponent } from './components/taux-de-change/taux-de-change.component';
import { CryptoBalanceComponent } from './shared/components/crypto-balance/crypto-balance.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ValidationComponent,
    ForgotPasswordComponent,
    DialogComponent,
    HeaderComponent,
    FeatherIconsComponent,
    ModeComponent,
    NotificationComponent,
    ClientComponent,
    AdminComponent,
    ChatComponent,
    MaximizeComponent,
    SearchComponent,
    UserInfoComponent,
    SidebarComponent,
    FooterComponent,
    BreadcrumbComponent,
    AddCryptoComponent,
    PageNotFoundComponent,
    ConfirmLoginComponent,
    HomeComponent,
    RechargeCompteComponent,
    MyListingComponent,
    ProfileComponent,
    ProfileFinanceComponent,
    VariationCryptoComponent,
    ProfileEditComponent,
    UploadFileComponent,
    RetirerFondsComponent,
    ConvertirCryptoDeviseComponent,
    EnterEmailComponent,
    SendCryptoComponent,
    TauxDeChangeComponent,
    CryptoBalanceComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxCaptchaModule,
    HttpClientModule,
    NgApexchartsModule,
    NgxDropzoneModule,
    AngularSvgIconModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
