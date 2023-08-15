import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashbordUserComponent } from './pages/dashbord-user/dashbord-user.component';

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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
