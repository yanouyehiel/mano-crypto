import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashbordUserComponent } from './pages/dashbord-user/dashbord-user.component';
import { ValidationComponent } from './pages/validation/validation.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'pages/login',
    pathMatch: 'full'
  },
  {
    path: 'pages/login',
    component: LoginComponent
  },
  {
    path: 'pages/register',
    component: RegisterComponent
  },
  {
    path: 'pages/dashbord',
    component: DashbordUserComponent
  },
  {
    path: 'pages/validation-compte',
    component: ValidationComponent
  },
  {
    path: 'pages/forgot-password',
    component: ForgotPasswordComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
