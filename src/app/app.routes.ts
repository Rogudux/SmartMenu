import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
  // raíz siempre redirige al login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // ruta de login usando componente (no lazy)
  { path: 'login', component: LoginComponent },

  // cargar las rutas de tabs desde su archivo independiente
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then(m => m.routes),
  },

  // cualquier ruta desconocida vuelve al login
  { path: '**', redirectTo: 'login', pathMatch: 'full' },
];
