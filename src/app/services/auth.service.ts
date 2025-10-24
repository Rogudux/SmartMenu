import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user';

const LS_KEY = 'atl_user'; // clave en localStorage

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(this.readFromLS());
  public currentUser$ = this.userSubject.asObservable();

  /** Llama esto al iniciar sesión (con el user que te da tu backend) */
  setUser(user: User | null): void {
    this.userSubject.next(user);
    if (user) {
      localStorage.setItem(LS_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LS_KEY);
    }
  }

  /** Obtén el valor actual (útil fuera del template) */
  getUser(): User | null {
    return this.userSubject.value;
  }

  /** Logout rápido */
  clear(): void {
    this.setUser(null);
  }

  // ---------- helpers ----------
  private readFromLS(): User | null {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      // si algo está corrupto, limpiamos
      localStorage.removeItem(LS_KEY);
      return null;
    }
  }
}
