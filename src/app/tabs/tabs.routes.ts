import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '', // <-- vacío porque se monta en 'tabs' desde app.routes
    component: TabsPage,
    children: [
      {
        path: 'pedidos',
        loadComponent: () => import('../tab1/tab1.page').then((m) => m.Tab1Page),
      },
      {
        path: 'menu',
        loadComponent: () => import('../tab2/tab2.page').then((m) => m.Tab2Page),
      },
      {
        path: 'clientes',
        loadComponent: () => import('../tab3/tab3.page').then((m) => m.Tab3Page),
      },
      {
        path: 'inventario',
        loadComponent: () => import('../tab4/tab4.component').then((m) => m.Tab4Page),
      },
      {
        path: 'cuenta',
        loadComponent: () => import('../tab5/tab5.component').then((m) => m.Tab5Page),
      },
      {
        path: '',
        redirectTo: 'pedidos', // <-- redirige localmente a tab1
        pathMatch: 'full',
      },
    ],
  },  
];
