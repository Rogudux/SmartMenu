import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rol } from '../models/rol';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RolService {
  private base = environment.apiBase + environment.endpoints.roles;
  constructor(private http: HttpClient) {}
  getAllRoles(): Observable<Rol[]> { return this.http.get<Rol[]>(this.base); }
}
