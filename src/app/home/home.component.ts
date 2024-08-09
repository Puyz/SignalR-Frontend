import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { UserModel } from '../models/user.model';
import { ChatModel } from '../models/chat.model';
import * as signalR from '@microsoft/signalr';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  message: string = "";
  users: UserModel[] = [];
  chats: ChatModel[] = [];
  selectedUserId: string = "";
  selectedUser: UserModel = new UserModel();
  currentUser: UserModel = new UserModel();
  hub: signalR.HubConnection | undefined;

  constructor(private authService: AuthService, private http: HttpClient) {
    this.currentUser = JSON.parse(localStorage.getItem("accessToken") ?? "");
    this.getUsers();

    this.hub = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7047/chat-hub")
      .withAutomaticReconnect()
      .build();

    this.hub.start().then(() => {
      this.hub?.invoke("Connect", this.currentUser.id);
    });

    this.hub.on("users", (response: UserModel) => {
      this.users.find(p => p.id == response.id)!.status = response.status;
    });

    this.hub.on("messages", (response: ChatModel) => {
      if(this.selectedUser.id === response.userId){
        this.chats.push(response);
      }
    });

  }

  logout() {
    this.authService.logout();
  }

  sendMessage() {
    const data = {
      userId: this.currentUser.id,
      toUserId: this.selectedUser.id,
      message: this.message
    };
    this.http.post<ChatModel>(`https://localhost:7047/api/Chats/SendMessage`, data).subscribe(res => {
      this.chats.push(res);
      this.message= "";
    });
  }

  getUsers() {
    this.http.get<UserModel[]>("https://localhost:7047/api/Chats/GetUsers").subscribe((response) => {
      this.users = response.filter(r => r.id != this.currentUser.id);
    });
  }


  changeUser(user: UserModel) {
    this.selectedUserId = user.id;
    this.selectedUser = user;

    this.http.get<ChatModel[]>(`https://localhost:7047/api/Chats/GetChats?userId=${this.currentUser.id}&toUserId=${this.selectedUser.id}`)
      .subscribe(response => {
        this.chats = response;
      });
  }

}

