import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, throwError, switchMap, of } from 'rxjs';
import { Pedido } from '../models/pedido';
import { environment } from '../../environments/environment';

export type PedidoPlatilloDto = { idPlatillo: number; cantidad: number };
export type CreatePedidoDto = {
  mesa: number;
  idUsuario: number;
  estado: 'pendiente'|'en preparacion'|'listo'|'entregado';
  platillos: PedidoPlatilloDto[];
};
export type UpdatePedidoDto = CreatePedidoDto;

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private base = new URL(environment.endpoints.pedidos, environment.apiBase).toString();
  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  constructor(private http: HttpClient) {}

  /** Lista (sin detalle) */
  getAllPedidos(): Observable<Pedido[]> {
    return this.http.get<any>(this.base).pipe(
      map(res => {
        const raw = Array.isArray(res) ? res
          : Array.isArray(res?.data) ? res.data
          : Array.isArray(res?.content) ? res.content
          : Array.isArray(res?.items) ? res.items
          : [];
        return raw;
      }),
      map((arr: any[]) => arr.map(r => ({
        id: r.id ?? r.idPedido ?? r.pedidoId,
        mesa: r.mesa ?? r.idMesa ?? r.table ?? 0,
        idUsuario: r.idUsuario ?? r.usuarioId ?? r.userId ?? 0,
        estado: r.estado ?? r.status ?? '',
        fecha: r.fecha ?? r.fechaCreacion ?? r.createdAt ?? new Date().toISOString(),
        nombreUsuario: r.nombreUsuario ?? r.usuario?.nombre ?? r.nombre ?? '',
        total: r.total ?? r.montoTotal ?? r.totalPedido ?? 0,
        // si el backend ya embebe platillos en el listado:
        platillos: Array.isArray(r.platillos)
          ? r.platillos.map((p: any) => ({
              idPlatillo: p.idPlatillo ?? p.id ?? p.platilloId,
              nombrePlatillo: p.nombrePlatillo ?? p.nombre ?? '',
              cantidad: p.cantidad ?? p.qty ?? 1,
              precio: p.precio ?? p.price ?? 0,
            }))
          : undefined
      } as Pedido))),
    );
  }

  /** Detalle por id (con platillos) */
  getPedido(id: number): Observable<Pedido> {
    return this.http.get<any>(`${this.base}/${id}`, this.httpOptions).pipe(
      map(r => ({
        id: r.id ?? r.idPedido ?? r.pedidoId,
        mesa: r.mesa ?? r.idMesa ?? r.table ?? 0,
        idUsuario: r.idUsuario ?? r.usuarioId ?? r.userId ?? 0,
        estado: r.estado ?? r.status ?? '',
        fecha: r.fecha ?? r.fechaCreacion ?? r.createdAt ?? new Date().toISOString(),
        nombreUsuario: r.nombreUsuario ?? r.usuario?.nombre ?? r.nombre ?? '',
        total: r.total ?? r.montoTotal ?? r.totalPedido ?? 0,
        platillos: Array.isArray(r.platillos)
          ? r.platillos.map((p: any) => ({
              idPlatillo: p.idPlatillo ?? p.id ?? p.platilloId,
              nombrePlatillo: p.nombrePlatillo ?? p.nombre ?? '',
              cantidad: p.cantidad ?? p.qty ?? 1,
              precio: p.precio ?? p.price ?? 0,
            }))
          : []
      } as Pedido))
    );
  }

  /** Crear pedido (estructura completa) */
  createPedido(body: CreatePedidoDto): Observable<Pedido> {
    return this.http.post<Pedido>(this.base, body, this.httpOptions);
  }

  /**
   * (Legacy) Update completo. Tu backend hoy NO lo soporta.
   * Déjalo por si luego habilitan edición total.
   */
  updatePedido(id: number, body: UpdatePedidoDto): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.base}/${id}`, body, this.httpOptions);
  }

  /** Cambiar solo el estado: PUT /pedidos/:id/estado  { estado: 'listo' } */
  updatePedidoEstado(
    id: number,
    estado: 'pendiente'|'en preparacion'|'listo'|'entregado'
  ): Observable<Pedido> {
    const url = `${this.base}/${id}/estado`;
    const payload = { estado };
    return this.http.put<Pedido>(url, payload, this.httpOptions).pipe(
      catchError(err => {
        // fallback si el server solo acepta POST
        if (err?.status === 405) {
          return this.http.post<Pedido>(url, payload, this.httpOptions);
        }
        return throwError(() => err);
      })
    );
  }

  /** Eliminar pedido */
  deletePedido(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
