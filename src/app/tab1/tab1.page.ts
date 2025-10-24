import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonSegment, IonSegmentButton, IonLabel, IonIcon, IonButton } from '@ionic/angular/standalone';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user';
import { ListaPedidosComponent } from '../components/lista-pedidos/lista-pedidos.component';

type PedidoFiltro = 'todos' | 'listo' | 'en preparacion' | 'pendiente' | 'entregado';

@Component({
  selector: 'app-tab1',
  standalone: true,
  imports: [IonButton, IonIcon, 
    CommonModule,                         // <- trae *ngIf y async pipe
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonSegment, IonSegmentButton, IonLabel,
    ListaPedidosComponent
  ],
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  // 👇 current user visible en el template
  public user$: Observable<User | null>;

  // 👇 filtro tipado para que compile [filtro]
  public selectedFilter: PedidoFiltro = 'todos';

  constructor(private auth: AuthService) {
    this.user$ = this.auth.currentUser$; // <- vuelve a enlazar tu observable
  }

  onFilterChange(ev: CustomEvent) {
    const v = String((ev.detail as any).value);
    if (v === 'todos' || v === 'listo' || v === 'en preparacion' || v === 'pendiente' || v === 'entregado') {
      this.selectedFilter = v as PedidoFiltro;
    }
  }
}
