import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente';
import { environment } from '../../environments/environment';

export type CreateClienteDto = Omit<Cliente, 'id'>;
export type UpdateClienteDto = Omit<Cliente, 'id'>;

@Injectable({ providedIn: 'root' })
export class ClienteService {
  // GET “legacy”
  private getAllURL = environment.apiBase + environment.endpoints.clientesGetAll;
  // CRUD real (si lo habilitas)
  private base = environment.apiBase + environment.endpoints.clientesCrud;

  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  constructor(private http: HttpClient){}

  getAllClientes(): Observable<Cliente[]> { return this.http.get<Cliente[]>(this.getAllURL); }
  createCliente(body: CreateClienteDto): Observable<Cliente> { return this.http.post<Cliente>(this.base, body, this.httpOptions); }
  updateCliente(id: number, body: UpdateClienteDto): Observable<Cliente> { return this.http.put<Cliente>(`${this.base}/${id}`, body, this.httpOptions); }
  deleteCliente(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
