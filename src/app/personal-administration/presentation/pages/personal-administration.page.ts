import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-personal-administration',
  standalone: true, // 👈 si es standalone
  imports: [CommonModule, FormsModule], // 👈 agrega estos módulos
  templateUrl: './personal-administration.page.html',
  styleUrls: ['./personal-administration.page.css']
})
export class PersonalAdministrationPage {
  users = [
    { id: 1, name: 'Juan Pérez', role: 'Administrador' },
    { id: 2, name: 'Ana López', role: 'Usuario' },
  ];

  selectedUser = { id: 0, name: '', role: '' };

  saveUser() {
    if (this.selectedUser.id === 0) {
      this.selectedUser.id = this.users.length + 1;
      this.users.push({ ...this.selectedUser });
    } else {
      const index = this.users.findIndex(u => u.id === this.selectedUser.id);
      this.users[index] = { ...this.selectedUser };
    }
    this.selectedUser = { id: 0, name: '', role: '' };
  }

  editUser(user: any) {
    this.selectedUser = { ...user };
  }

  deleteUser(id: number) {
    this.users = this.users.filter(u => u.id !== id);
  }
}
