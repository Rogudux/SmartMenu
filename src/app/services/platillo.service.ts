import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { Platillo } from '../models/platillo';
import { environment } from '../../environments/environment';

export type CreatePlatilloDto = Omit<Platillo, 'id'>;
export type UpdatePlatilloDto = Omit<Platillo, 'id'>;

@Injectable({ providedIn: 'root' })
export class PlatilloService {
  private base = environment.apiBase + environment.endpoints.platillos;
  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  constructor(private http: HttpClient) {}

  getAllPlatillos(): Observable<Platillo[]> {
    return this.http.get<Platillo[]>(this.base);
  }

  createPlatillo(body: CreatePlatilloDto): Observable<Platillo> {
    return this.http.post<Platillo>(this.base, body, this.httpOptions);
  }

  updatePlatillo(id: number, body: UpdatePlatilloDto): Observable<Platillo> {
    return this.http.put<Platillo>(`${this.base}/${id}`, body, this.httpOptions);
  }

  deletePlatillo(id: number): Observable<void> {
    // Soporta 200/204 sin cuerpo (texto/vacío)
    return this.http.delete(`${this.base}/${id}`, { observe: 'response', responseType: 'text' as 'json' }).pipe(
      map(() => void 0),
      catchError(err => {
        // Fallback si el backend no permite DELETE (405) pero tiene una ruta alternativa
        if (err?.status === 405) {
          // Si NO hay endpoint alterno, quita este bloque.
          const alt = `${this.base}/${id}/delete`;
          return this.http.post(alt, {}, this.httpOptions).pipe(map(() => void 0));
        }
        return throwError(() => err);
      })
    );
  }
}
