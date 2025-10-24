import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Inventario } from '../models/inventario';
import { environment } from '../../environments/environment';

export type CreateInventarioDto = Omit<Inventario, 'id'>;
export type UpdateInventarioDto = Omit<Inventario, 'id'>;

@Injectable({ providedIn: 'root' })
export class InventarioService {
  // GET “legacy”
  private getAllURL = environment.apiBase + environment.endpoints.inventarioGetAll;
  // CRUD real
  private base = environment.apiBase + environment.endpoints.inventarioCrud;

  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  constructor(private http: HttpClient) {}

  getAllInventario(): Observable<Inventario[]> { return this.http.get<Inventario[]>(this.getAllURL); }
  createInventario(body: CreateInventarioDto): Observable<Inventario> { return this.http.post<Inventario>(this.base, body, this.httpOptions); }
  updateInventario(id: number, body: UpdateInventarioDto): Observable<Inventario> { return this.http.put<Inventario>(`${this.base}/${id}`, body, this.httpOptions); }
  deleteInventario(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
