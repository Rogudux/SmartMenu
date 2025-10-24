import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { environment } from '../../environments/environment';

export type CreateUserDto = {
  nombre: string;
  correo: string;
  contraseña: string;  // 👈 tal cual lo pide tu backend
  idRol: number;
};

export type UpdateUserDto = {
  nombre: string;
  correo: string;
  idRol: number;
  contraseña?: string; // opcional en update (si viene vacía no se envía)
};

@Injectable({ providedIn: 'root' })
export class UserService {
  private base = new URL(environment.endpoints.users, environment.apiBase).toString();
  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.base);
  }

  createUser(body: CreateUserDto): Observable<User> {
    // Enviar EXACTAMENTE las claves que espera el backend
    const payload: any = {
      nombre: body.nombre,
      correo: body.correo,
      contraseña: body.contraseña,
      idRol: Number(body.idRol),
    };
    return this.http.post<User>(this.base, payload, this.httpOptions);
  }

  updateUser(id: number, body: { nombre: string; correo: string; contraseña?: string; idRol: number }) {
  // Construye el payload explícitamente y en el orden esperado
  const payload: any = {
    nombre: body.nombre,
    correo: body.correo,
    idRol: Number(body.idRol),
  };
  // Solo incluye contraseña si viene (si la dejas vacía NO se manda)
  if (body.contraseña && body.contraseña.trim()) {
    payload.contraseña = body.contraseña;
  }
  return this.http.put<User>(`${this.base}/${id}`, payload, this.httpOptions);
}

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
