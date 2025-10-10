import { Injectable } from '@angular/core';
import { User } from '../domain/user.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  private users: User[] = [
    { id: 1, name: 'Juan Pérez Díaz', role: 'Vendedor', email: 'perez.j@company.com', status: 'Activo' },
    { id: 2, name: 'María López Gonzales', role: 'Vendedor', email: 'lopez.m@company.com', status: 'Inactivo' },
    { id: 3, name: 'Luis Ramírez Hurtado', role: 'Vendedor', email: 'ramirez.l@company.com', status: 'Activo' },
    { id: 4, name: 'Juan Pérez Aguirre', role: 'Administrador', email: 'admin@company.com', status: 'Activo' }
  ];

  getAllUsers(): Observable<User[]> {
    return of(this.users);
  }

  addUser(user: User): void {
    user.id = this.users.length + 1;
    this.users.push(user);
  }

  deleteUser(id: number): void {
    this.users = this.users.filter(u => u.id !== id);
  }
}
