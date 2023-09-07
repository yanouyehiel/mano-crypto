import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ClientComponent } from './shared/components/layout/client/client.component';
import { ValidationComponent } from './pages/validation/validation.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ClientGuard } from './guard/client.guard';
import { content } from './shared/routes/routes';
import { AddCryptoComponent } from './components/add-crypto/add-crypto.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { ConfirmLoginComponent } from './pages/confirm-login/confirm-login.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'auth/confirm-login',
    component: ConfirmLoginComponent
  },
  {
    path: 'auth/register',
    component: RegisterComponent
  },
  {
    path: 'client',
    component: ClientComponent,
    children: [
      {
        path: 'add-crypto',
        component: AddCryptoComponent
      },
    ]
  },
  {
    path: 'auth/validation-compte',
    component: ValidationComponent
  },
  {
    path: 'auth/forgot-password',
    component: ForgotPasswordComponent
  },
  
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
