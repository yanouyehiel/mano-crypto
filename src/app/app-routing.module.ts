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
import { HomeComponent } from './components/home/home.component';
import { RechargeCompteComponent } from './components/recharge-compte/recharge-compte.component';
import { MyListingComponent } from './components/my-listing/my-listing.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ProfileEditComponent } from './components/profile-edit/profile-edit.component';
import { RetirerFondsComponent } from './components/retirer-fonds/retirer-fonds.component';

import { ConvertirCryptoDeviseComponent } from './components/convertir-crypto-devise/convertir-crypto-devise.component';
import { EnterEmailComponent } from './pages/enter-email/enter-email.component';
import { SendCryptoComponent } from './components/send-crypto/send-crypto.component';
import { TauxDeChangeComponent } from './components/taux-de-change/taux-de-change.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    component: LoginComponent
  },
  {
    path: 'auth/confirm-login/:email',
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
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'profile',
        component: ProfileComponent
      },
      {
        path: 'profile-edit',
        component: ProfileEditComponent
      },
      {
        path: 'add-crypto',
        component: AddCryptoComponent
      },
      {
        path: 'recharge-compte',
        component: RechargeCompteComponent
      },
      {
        path: 'my-listing',
        component: MyListingComponent
      },
      {
        path: 'retrait-fonds',
        component: RetirerFondsComponent
      },
      {
        path: 'convertir-crypto',
        component: ConvertirCryptoDeviseComponent
      },
      {
        path: 'retirer-crypto',
        component: SendCryptoComponent
      },

      {
        path: 'taux-change',
        component: TauxDeChangeComponent
      }
    ]
  },
  {
    path: 'auth/validation-compte',
    component: ValidationComponent
  },
  {
    path: 'auth/enter-email',
    component: EnterEmailComponent
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
