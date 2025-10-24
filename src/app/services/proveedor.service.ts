import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Proveedor {
  id: number;
  nombre: string;
  telefono: string;
  correoProveedor: string;
}

export type CreateProveedorDto = Omit<Proveedor, 'id'>;
export type UpdateProveedorDto = Omit<Proveedor, 'id'>;

@Injectable({ providedIn: 'root' })
export class ProveedorService {
  // 👇 Usamos el path que indicaste para TODO (GET/POST/PUT/DELETE)
  private base = 'https://ash-meters-genealogy-exports.trycloudflare.com/smartMenux/api/proveedores';
  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  constructor(private http: HttpClient) {}

  getAllProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(this.base);
  }

  createProveedor(body: CreateProveedorDto): Observable<Proveedor> {
    return this.http.post<Proveedor>(this.base, body, this.httpOptions);
  }

  updateProveedor(id: number, body: UpdateProveedorDto): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.base}/${id}`, body, this.httpOptions);
  }

  deleteProveedor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
