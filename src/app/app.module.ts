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
    SidebarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule, 
    NgxCaptchaModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
