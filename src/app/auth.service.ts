import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterModel } from './models/register.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router, private http: HttpClient) { }

  isAuthenticated() {
    if (localStorage.getItem("accessToken")) {
      return true;
    }

    this.router.navigateByUrl("/login");
    return false;
  }

  register(registerModel: RegisterModel) {
    const formData = new FormData();
    formData.append("name", registerModel.name);
    formData.append("avatar", registerModel.avatar, registerModel.avatar.name);
    this.http.post(`https://localhost:7047/api/Auth/Register`, formData).subscribe(res => {
      this.router.navigateByUrl("/login");
    });
  }

  login(name: string) {
    this.http.get(`https://localhost:7047/api/Auth/Login?name=${name}`).subscribe(res => {
      localStorage.setItem("accessToken", JSON.stringify(res));
      this.router.navigateByUrl("/");
    });
  }

  logout() {
    localStorage.removeItem("accessToken");
    //this.router.navigateByUrl("/login");
    location.reload();
  }
}
