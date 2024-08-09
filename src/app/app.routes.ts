import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const routes: Routes = [
    { path: "", component: HomeComponent, canActivate: [() => inject(AuthService).isAuthenticated()] },
    { path: "login", component: LoginComponent },
    { path: "register", component: RegisterComponent }
];
